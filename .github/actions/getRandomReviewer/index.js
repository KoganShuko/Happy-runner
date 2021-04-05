import fetch from 'node-fetch';
import _ from 'lodash';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as request from '@octokit/request';
import * as graphql from '@octokit/graphql';
import Octokit from '@octokit/rest';

async function getRandomReviewer() {
  try {
    const token = core.getInput('token')
  /*   console.log(github, github.GitHub)
    let pr = new github.GitHub(token)
    let resp = pr.pulls.list({
        owner: repoOwner,
        repo: repo,
    }).catch(
        e => {
            console.log(e.message)
        }
    )
    console.log(resp); */

const date = new Date();
const today = `${date.getFullYear()}-0${date.getMonth() + 1}-0${date.getDate() - 1}`
console.log(date, today)
    const pulls2 = await graphql.graphql(
      ` {
         search(query: "repo:KoganShuko/Happy-runner is:pr created:>${today}", type: ISSUE, last: 100) {
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
     pulls2.search.edges.forEach((pull) => {
       console.log(pull);
       console.log(pull.node.reviewRequests.nodes);

     })
   /*  const pulls = await request.request('GET /repos/{owner}/{repo}/pulls?state=all&sort=created&direction=desc', {
      owner: 'KoganShuko',
      repo: 'Happy-runner'
    });
    console.log(pulls);

    const pulls2 = await graphql.graphql(
     ` {
        search(query: "repo:KoganShuko/Happy-runner is:pr created:>2019-04-01") {
          edges {
            node {
              ... on PullRequest {
                requested_reviewers
              }
            }
          }
        }
      }`
    )
    console.log(pulls2); */
   /*  const storageId = core.getInput('storageId');
    const storageKey = core.getInput('storageToken');
    const owner = core.getInput('owner');
    console.log(github);
    const headers = {
      'Content-Type': 'application/json',
      'X-Master-Key': storageKey,
    };
    const reviewersData = await fetch(
      `https://api.jsonbin.io/v3/b/${storageId}/latest`,
      { headers }
    );
    const {
      record: { reviewers },
    } = await reviewersData.json();
    reviewers.sort((prev, cur) => prev.count - cur.count);
    const activeReviewers = reviewers.filter(
      (reviewer) => {
        console.log('eviewer.name', reviewer.name, 'owner', owner)
        return reviewer.isActive && reviewer.name !== owner;
      }
    );
    console.log(activeReviewers, 'activeReviewers');
    const smallestReviewCount = activeReviewers[0].count;
    const potentialReviewers = activeReviewers.filter(
      (reviewer) => reviewer.count === smallestReviewCount
    );
    console.log(potentialReviewers, 'potentialReviewers');
    const { name, slackId } = _.shuffle(potentialReviewers)[0];
    console.log(name, 'YO');
    core.setOutput('name', name);
    core.setOutput('slackId', slackId); */
  } catch (e) {
    core.setFailed(e);
  }
}

getRandomReviewer();
