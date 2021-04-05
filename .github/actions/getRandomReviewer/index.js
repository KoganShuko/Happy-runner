import { shuffle } from 'lodash';
import * as core from '@actions/core';
import * as graphql from '@octokit/graphql';
import * as github from '@actions/github';
import config from './config.json';

async function getRandomReviewer() {
  try {
    const token = core.getInput('token');
    const owner = core.getInput('owner');
    const headers = {
      headers: {
        authorization: `token ${token}`,
      },
    };
    console.log(github);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().substr(0, 10);

    const pullsRequests = await graphql(
      ` {
         search(query: "repo:KoganShuko/Happy-runner is:pr created:>${yesterdayISO}", type: ISSUE, last: 100) {
           edges {
             node {
               ... on PullRequest {
                  reviewRequests(first: 100) {
                    nodes {
                      requestedReviewer {
                        ... on User {
                          login
                        }
                      }
                    }
                  }
               }
             }
           }
         }
       }`,
      headers
    );

    const tempBalancer = {};

    const { reviewers } = config;

    const availabilityPromises = [];

    const getUserAvailability = (user) => {
      availabilityPromises.push(
        new Promise(async (res) => {
          const userData = await graphql.graphql(
            `
            query { 
              user(login:"${user}") { 
                status {
                  indicatesLimitedAvailability
                }
              }
            }
            `,
            headers
          );
          tempBalancer[user].isActive = !(
            userData.user.status &&
            userData.user.status.indicatesLimitedAvailability
          );
          res();
        })
      );
    };

    reviewers.forEach((reviewer) => {
      tempBalancer[reviewer.name] = {
        slackId: reviewer.slackId,
        reviewCount: 0,
      };
      getUserAvailability(reviewer.name);
    });

    pullsRequests.search.edges.forEach((pull) => {
      pull.node.reviewRequests.nodes.forEach((review) => {
        if (review) {
          const {
            requestedReviewer: { login },
          } = review;
          tempBalancer[login].reviewCount += 1;
        }
      });
    });
    await Promise.all(availabilityPromises);
    const updatedReviewerData = reviewers
      .map((reviewer) => {
        return {
          ...reviewer,
          reviewCount: tempBalancer[reviewer.name].reviewCount,
          isActive: tempBalancer[reviewer.name].isActive,
        };
      })
      .sort((prev, cur) => {
        return prev.reviewCount - cur.reviewCount;
      });

    const smallestReviewCount = updatedReviewerData[0].reviewCount;

    const potentialReviewers = updatedReviewerData.filter((data) => {
      return (
        data.isActive &&
        data.name !== owner &&
        data.reviewCount === smallestReviewCount
      );
    });

    const nextReviewer = shuffle(potentialReviewers);
    console.log(nextReviewer, tempBalancer)
    core.setOutput('name', nextReviewer.name);
    core.setOutput('slackId', nextReviewer.slackId);
  } catch (e) {
    core.setFailed(e);
  }
}

getRandomReviewer();
