import fetch from 'node-fetch';
import _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';
/* import * as request from '@octokit/request'; */
import * as graphql from '@octokit/graphql';
import Octokit from '@octokit/rest';
import config from './config.json';

async function getRandomReviewer() {
  try {
    const token = core.getInput('token');
    const yesterday = new Date()
    
    yesterday.setDate(yesterday.getDate() - 1)
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
      /*  console.log(pull.node.reviewRequests.nodes.requestedReviewer.login); */

     })

     const tempBalancer = {};

     const { reviewers } = config;

     const promises = [];
     const getUserAvailability = (user) => {
      promises.push(
        new Promise(async(res) => {
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
            {
              headers: {
                authorization: `token ${token}`,
          },
       })
       console.log(user, userData.user)
       tempBalancer[user].isActive = userData.user.status && userData.user.status.indicatesLimitedAvailability;
       res();
        })
      )
     };
     
     reviewers.forEach((reviewer) => {
      tempBalancer[reviewer.name] = {
        slackId: reviewer.slackId,
        reviewCount: 0,
      }
      getUserAvailability(reviewer.name);
     })

     pullsRequests.search.edges.forEach((pull) => {
       const reviewer = pull.node.reviewRequests.nodes.requestedReviewer && pull.node.reviewRequests.nodes.requestedReviewer.login;
       if (reviewer) {
         tempBalancer[reviewer].reviewCount += 1;
       }
    })
    const lala = reviewers.map((reviewer) => {
      return {
        ...reviewer,
        reviewCount: tempBalancer[reviewer.name].reviewCount,
        isActive: tempBalancer[reviewer.name].isActive,
      }
    })

    console.log(lala, 'lala')


     
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
