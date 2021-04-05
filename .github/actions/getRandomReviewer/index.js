import fetch from 'node-fetch';
import _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as request from '@octokit/request';
import * as graphql from '@octokit/graphql';
import Octokit from '@octokit/rest';
import config from './config.json';

async function getRandomReviewer() {
  try {
    const token = core.getInput('token');
    const now = new Date();
    const yesterday = now.setDate(now.getDate() - 1)
    console.log(now, yesterday)
    const yesterdayISO = yesterday.toISOString().substr(0, 10);

    const pullsRequests = await graphql.graphql(
      ` {
         search(query: "repo:KoganShuko/Happy-runner is:pr created:>${yesterdayISO}", type: ISSUE, last: 100) {
           edges {
             node {
               ... on PullRequest {
                  reviewRequests(first: 100) {
                    nodes {
                      requestedReviewer {
                        ... on User {
                          name
                          login
                        }
                      }
                    }
                  }
                  title
                  createdAt
                  reviews(last: 10) {
                    nodes {
                      author {
                        login
                      }
                    }
                  }
               }
             }
           }
         }
       }`,
       {
         headers: {
           authorization: `token ${token}`,
         },
       }
     )
     pullsRequests.search.edges.forEach((pull) => {
       console.log(pull);
       console.log(pull.node.reviewRequests.nodes);

     })

     const tempBalancer = {};

     const { reviewers } = config;

     const promises = [];
     const getUserAvailability = (user) => {
      promises.push(
        new Promise(async(res) => {
            tempBalancer[user].isActive = await graphql.graphql(
              `
            query { 
              user(login:"${user}") { 
                status {
                  indicatesLimitedAvailability
                }
              }
            }
            `,
            {
              headers: {
                authorization: `token ${token}`,
          },
       })
       res();
        })
      )
     };
     
     reviewers.forEach((reviewer) => {
      tempBalancer[reviewer.name] = {
        slackId: reviewer.slackId,
        counter: 0,
      }
      getUserAvailability(reviewer);
     })
     
   /*   const user = await graphql.graphql(
       `
      query { 
        user(login:"KoganShuko") { 
          status {
            indicatesLimitedAvailability
          }
        }
      }
      `,
      {
        headers: {
          authorization: `token ${token}`,
    },
  }) */
  await Promise.all(promises)
console.log(tempBalancer);
  
  } catch (e) {
    core.setFailed(e);
  }
}

getRandomReviewer();
