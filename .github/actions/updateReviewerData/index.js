import fetch from 'node-fetch';
import * as core from '@actions/core';

async function updateReviewerData() {
  try {
    const storageId = core.getInput('storageId');
    const storageKey = core.getInput('storageToken');
    const name = core.getInput('name');
    const jsonVersionData = await fetch(`https://api.jsonbin.io/v3/b/${storageId}/versions/count`, { headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': storageKey,
    }});
    const { metaData: { versionCount }} = await jsonVersionData.json();
    const reviewersData = await fetch(`https://api.jsonbin.io/v3/b/${storageId}/${versionCount === 0 ? '' : versionCount}`, { headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': storageKey,
    }});
    const { record: { reviewers }} = await reviewersData.json();
    const index = reviewers.findIndex((reviewer) => reviewer.name === name);
    reviewers[index].count += 1;
    const updatedData = { reviewers: [...reviewers]};
    await fetch(`https://api.jsonbin.io/v3/b/${storageId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': storageKey,
      }
    });
  } catch (e) {
    core.setFailed(e);
  }
}

updateReviewerData();
