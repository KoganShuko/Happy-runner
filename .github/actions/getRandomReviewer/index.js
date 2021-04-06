import { shuffle } from 'lodash';
import * as core from '@actions/core';
import { graphql } from '@octokit/graphql';
import * as github from '@actions/github';
import { reviewers } from './config';

async function getRandomReviewer() {
  try {
    const token = core.getInput('token');
    const headers = {
      headers: {
        authorization: `token ${token}`,
      },
    };
    const repoName = github.context.payload.repository.name;
    const repoOwner = github.context.payload.repository.owner.login;
    const pullRequestOwner = github.context.actor;

    const date = new Date();
    const dateISO = date.toISOString().substr(0, 10);

    const pullsRequests = await graphql(
      ` {
          search(query: "repo:${repoOwner}/${repoName} is:pr created:>=${dateISO}", type: ISSUE, last: 100) {
            edges {
              node {
                ... on PullRequest {
                  createdAt
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
        }
      `,
      headers
    );

    console.log(new Date(), new Date().toLocaleString("en-US", {timeZone: "Europe/Moscow"}))
    // для подсчета кол-ва ревью
    const tempBalancer = {};

    // сохраняет промисы от запросов на доступность юзера для ожидания получения всех данных
    const availabilityPromises = [];

    const getUserAvailability = (user) => {
      availabilityPromises.push(
        new Promise(async (res) => {
          const userData = await graphql(
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

    // добавление reviewCount и isActive в tempBalancer
    reviewers.forEach((reviewer) => {
      tempBalancer[reviewer.name] = {
        reviewCount: 0,
      };
      getUserAvailability(reviewer.name);
    });

    // подсчет ревью
    pullsRequests.search.edges.forEach((pull) => {
      pull.node.reviewRequests.nodes.forEach((review) => {
        if (review) {
          const {
            requestedReviewer: { login },
          } = review;
          if (tempBalancer[login]) {
            tempBalancer[login].reviewCount += 1;
          }
        }
      });
    });

    await Promise.all(availabilityPromises);

    // добавляем в исходный массив ревьюверов reviewCount и isActive
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

    const reviewersWithoutOwner = updatedReviewerData.filter(
      (reviewer) => reviewer.name !== pullRequestOwner
    );
    const smallestReviewCount = reviewersWithoutOwner[0].reviewCount;
    const potentialReviewers = reviewersWithoutOwner.filter(
      (reviewer) =>
        reviewer.isActive && reviewer.reviewCount === smallestReviewCount
    );
    const nextReviewer = shuffle(potentialReviewers)[0];

    console.log('updatedReviewerData: ', updatedReviewerData);
    console.log('-------------------------------------');
    console.log('nextReviewer: ', nextReviewer);
    core.setOutput('name', nextReviewer.name);
    core.setOutput('slackId', nextReviewer.slackId);
  } catch (e) {
    core.setFailed(e);
  }
}

getRandomReviewer();
