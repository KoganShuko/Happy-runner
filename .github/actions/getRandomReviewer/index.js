import fetch from 'node-fetch';
import _ from 'lodash';
import * as core from '@actions/core';

async function getRandomReviewer() {
  try {
    const storageId = core.getInput('storageId');
    const storageKey = core.getInput('storageToken');
    const owner = core.getInput('owner');
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
        console.log(reviewer.name, owner)
        return reviewer.isActive && reviewer.name !== owner;
      }
    );
    const smallestReviewCount = activeReviewers[0].count;
    const potentialReviewers = activeReviewers.filter(
      (reviewer) => reviewer.count === smallestReviewCount
    );
    const { name, slackId } = _.shuffle(potentialReviewers)[0];
    console.log(name);
    core.setOutput('name', name);
    core.setOutput('slackId', slackId);
  } catch (e) {
    core.setFailed(e);
  }
}

getRandomReviewer();
