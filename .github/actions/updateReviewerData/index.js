const fetch = require('node-fetch');
const core = require('@actions/core');

async function updateReviewerData() {
  try {
    const storageId = core.getInput('storageId');
    const storageKey = core.getInput('storageToken');
    const name = core.getInput('name');
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
    const index = reviewers.findIndex((reviewer) => reviewer.name === name);
    reviewers[index].count += 1;
    const updatedData = { reviewers: [...reviewers] };
    console.log(name)
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
