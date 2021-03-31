import fetch from 'node-fetch';
import * as core from '@actions/core';

const modes = {
  add: 'add',
  reset: 'reset',
};

async function updateReviewerData() {
  try {
    const storageId = core.getInput('storageId');
    const storageKey = core.getInput('storageToken');
    const name = core.getInput('name');
    const mode = core.getInput('mode');
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

    let updatedData = reviewers;
    if (mode === modes.add) {
      const index = reviewers.findIndex((reviewer) => reviewer.name === name);
      reviewers[index].count += 1;
      updatedData = { reviewers: [...reviewers] };
    } else if (mode === modes.reset) {
      updatedData = reviewers.map((reviewer, index) => {
        reviewers[index].count = 0;
        return reviewer;
      });
    }

    await fetch(`https://api.jsonbin.io/v3/b/${storageId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
      headers,
    });
  } catch (e) {
    core.setFailed(e);
  }
}

updateReviewerData();
