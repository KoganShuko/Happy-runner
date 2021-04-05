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
    const repoName = github.context.payload.repository.name;
    const repoOwner = github.context.payload.repository.owner.name;
    const pullRequestOwner = github.context.actor;
    console.log(github.context)
    const date = new Date();
    const dateISO = yesterday.toISOString().substr(0, 10);

    const pullsRequests = await graphql.graphql(
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

    // сохраняет промисы от запросов на доступность юзера для ожидания получения всех данных
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

    // для подсчета кол-ва ревью
    const tempBalancer = {};

    const { reviewers } = config;

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
          tempBalancer[login].reviewCount += 1;
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

    const smallestReviewCount = updatedReviewerData[0].reviewCount;

    // определяем список потенциальных ревьюверов
    const potentialReviewers = updatedReviewerData.filter((reviewer) => {
      return (
        reviewer.isActive &&
        reviewer.name !== pullRequestOwner &&
        reviewer.reviewCount === smallestReviewCount
      );
    });

    const nextReviewer = shuffle(potentialReviewers)[0];
    console.log('updatedReviewerData: ', updatedReviewerData)
    console.log('-------------------------------------')
    console.log('nextReviewer: ', nextReviewer)
    core.setOutput('name', nextReviewer.name);
    core.setOutput('slackId', nextReviewer.slackId);
  } catch (e) {
    core.setFailed(e);
  }
}

getRandomReviewer();
