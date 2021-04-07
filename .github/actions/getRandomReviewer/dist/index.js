module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 811:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ../../.nvm/versions/node/v14.15.1/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?lodash
var _notfoundlodash = __nccwpck_require__(845);
// EXTERNAL MODULE: ../../.nvm/versions/node/v14.15.1/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/core
var core = __nccwpck_require__(218);
// EXTERNAL MODULE: ../../.nvm/versions/node/v14.15.1/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@octokit/graphql
var graphql = __nccwpck_require__(505);
// EXTERNAL MODULE: ../../.nvm/versions/node/v14.15.1/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/github
var github = __nccwpck_require__(177);
// CONCATENATED MODULE: ./.github/actions/getRandomReviewer/config.js
const reviewers = [
  {
    name: 'KoganShuko',
    slackId: 'UBK40QGRM',
  },
/*   {
    name: 'egorov-staff-hub',
    slackId: 'U01KFVAEB09',
  }, */
  {
    name: 'testUCHI',
    slackId: 'U01DN1LAUUQ',
  },
  /* {
    name: 'abstractmage',
    slackId: 'ULFHQLP6W',
  },
  {
    name: 'aryzhkova',
    slackId: 'UAU9ENR3R',
  },
  {
    name: 'yujinmeru',
    slackId: 'UB1EN66UC',
  },
  {
    name: 'Helen2813',
    slackId: 'U01HMMH5J0G',
  },
  {
    name: 'mikhailkaryamin',
    slackId: 'U01M84FUG0Y',
  },
  {
    name: 'alexeyivanov-web',
    slackId: 'U01FB27BCG3',
  } */
];

// CONCATENATED MODULE: ./.github/actions/getRandomReviewer/index.js





// test
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

    const pullsRequests = await (0,graphql.graphql)(
      ` {
          search(query: "repo:${repoOwner}/${repoName} is:pr created:>=2021-04-04", type: ISSUE, last: 100) {
            edges {
              node {
                ... on PullRequest {
                  createdAt
                  reviewRequests(first: 100) {
                    nodes {
                      pullRequest {
                        latestReviews(first: 10) {
                          nodes {
                            author {
                              ... on Actor {
                                login
                              }
                            }
                          }
                        }
                        participants(first: 10) {
                          nodes {
                            login
                          }
                        }
                      }
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
    pullsRequests.search.edges[0].node.reviewRequests.nodes.forEach((pull) => {
      console.log(pull, pull.pullRequest.participants.nodes);
    })
    console.log('-----------------------------------')
    // для подсчета кол-ва ревью
    const tempBalancer = {};

    // сохраняет промисы от запросов на доступность юзера для ожидания получения всех данных
    const availabilityPromises = [];

    const getUserAvailability = (user) => {
      availabilityPromises.push(
        new Promise(async (res) => {
          const userData = await (0,graphql.graphql)(
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
      console.log('pull',pull)
      pull.node.reviewRequests.nodes.forEach((review) => {
        console.log('review',review)
        if (review) {
          const {
            requestedReviewer: { login },
          } = review;
          console.log(tempBalancer, tempBalancer[login], login, 'login')
          if (tempBalancer[login] !== undefined) {
            tempBalancer[login].reviewCount += 1;
            console.log(tempBalancer,'tempBalancer')
          }
        }
      });
    });

    await Promise.all(availabilityPromises);

    // добавляем в исходный массив ревьюверов reviewCount и isActive
    const updatedReviewerData = reviewers.map((reviewer) => {
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
    const nextReviewer = (0,_notfoundlodash.shuffle)(potentialReviewers)[0];

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


/***/ }),

/***/ 218:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 177:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 505:
/***/ ((module) => {

module.exports = eval("require")("@octokit/graphql");


/***/ }),

/***/ 845:
/***/ ((module) => {

module.exports = eval("require")("lodash");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(811);
/******/ })()
;