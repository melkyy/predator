/* eslint-disable no-prototype-builtins */
'use strict';

const uuid = require('uuid/v4');
const nock = require('nock');
const { expect } = require('chai');

const statsGenerator = require('./helpers/statsGenerator');
const reportsRequestCreator = require('./helpers/requestCreator');
const jobRequestCreator = require('../jobs/helpers/requestCreator');
const testsRequestCreator = require('../tests/helpers/requestCreator');
const configRequestCreator = require('../configManager/helpers/requestCreator');
const config = require('../../../src/common/consts').CONFIG;
const constants = require('../../../src/reports/utils/constants');
const kubernetesConfig = require('../../../src/config/kubernetesConfig');
const basicTest = require('../../testExamples/Basic_test');

const mailhogHelper = require('./mailhog/mailhogHelper');

const headers = { 'Content-Type': 'application/json' };


// describe.skip('Integration tests for the reports api', function () {

//     afterEach(async function () {
//         await mailhogHelper.clearAllOldMails();
//     });
//         describe('Get report', function () {
//             });
//         });
//         describe('Delete reports', function () {
//             const reportId = uuid();
//             const reportBody = {
//                 report_id: reportId,
//                 revision_id: uuid(),
//                 test_type: 'basic',
//                 test_name: 'integration-test',
//                 test_description: 'doing some integration testing',
//                 start_time: Date.now().toString(),
//                 last_updated_at: Date.now().toString(),
//                 test_configuration: {
//                     enviornment: 'test',
//                     duration: 10,
//                     arrival_rate: 20
//                 }
//             };
//             it('Delete report successfully', async function () {
//                 const testId = uuid();
//                 const reportId = uuid();
//                 reportBody.report_id = reportId;
//                 reportBody.job_id = jobId;

//                 reportBody.runner_id = uuid();
//                 const lastDate = new Date();
//                 reportBody.start_time = lastDate.setMinutes(lastDate.getMinutes() + 10).toString();
//                 const createReportResponse = await reportsRequestCreator.createReport(testId, reportBody);
//                 should(createReportResponse.statusCode).eql(201);

//                 await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', reportBody.runner_id));

//                 let getLastReportsResponse = await reportsRequestCreator.getLastReports(1);
//                 console.log(JSON.stringify(getLastReportsResponse));
//                 let lastReports = getLastReportsResponse.body;
//                 should(lastReports.length).eql(1);
//                 should(lastReports[0].report_id).eql(reportId);

//                 let reportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 should(reportResponse.body.report_id).eql(reportId);

//                 // Delete report
//                 let deleteResponse = await reportsRequestCreator.deleteReport(testId, reportId);
//                 should(deleteResponse.statusCode).eql(204);

//                 // Verify last report not retrieved
//                 getLastReportsResponse = await reportsRequestCreator.getLastReports(5);
//                 console.log(JSON.stringify(getLastReportsResponse));
//                 lastReports = getLastReportsResponse.body;
//                 const lastReportWithOriginalReportId = lastReports.find(report => report.report_id === reportId);
//                 should(lastReportWithOriginalReportId).eql(undefined);

//                 // Verify report not retrieved
//                 reportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 should(reportResponse.statusCode).eql(404);

//                 // Verify delete report which is deleted returns 404
//                 deleteResponse = await reportsRequestCreator.deleteReport(testId, reportId);
//                 should(deleteResponse.statusCode).eql(404);
//             });

//             it('Delete report which is in progress', async function () {
//                 const testId = uuid();
//                 const reportId = uuid();
//                 reportBody.report_id = reportId;
//                 reportBody.runner_id = uuid();
//                 const lastDate = new Date();
//                 reportBody.start_time = lastDate.setMinutes(lastDate.getMinutes() + 10).toString();
//                 const createReportResponse = await reportsRequestCreator.createReport(testId, reportBody);
//                 should(createReportResponse.statusCode).eql(201);

//                 const deleteRunningTestResponse = await reportsRequestCreator.deleteReport(testId, reportId);
//                 deleteRunningTestResponse.statusCode.should.eql(409);
//                 deleteRunningTestResponse.body.should.eql({
//                     message: "Can't delete running test with status initializing"
//                 });
//             });
//         });
//         describe('Post stats', function () {

//             after(async () => {
//                 await configRequestCreator.deleteConfig(config.BENCHMARK_WEIGHTS);
//                 await configRequestCreator.deleteConfig(config.BENCHMARK_THRESHOLD);
//             });

//             it('Post full cycle stats', async function () {
//                 const phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', runnerId));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 let getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 let report = getReportResponse.body;
//                 should(report.status).eql('started');

//                 let intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', runnerId));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');

//                 intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', runnerId));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');

//                 const doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', runnerId));
//                 should(doneStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 should(getReportResponse.statusCode).be.eql(200);
//                 report = getReportResponse.body;
//                 validateFinishedReport(report);
//             });

//             it('Post full cycle stats and verify report rps avg and assertions', async function () {
//                 const phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', runnerId));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);

//                 const getReport = await reportsRequestCreator.getReport(testId, reportId);
//                 should(getReport.statusCode).be.eql(200);
//                 const testStartTime = new Date(getReport.body.start_time);
//                 const statDateFirst = new Date(testStartTime).setSeconds(testStartTime.getSeconds() + 20);
//                 let intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', runnerId, statDateFirst, 600));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 let getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 let report = getReportResponse.body;
//                 should(report.avg_rps).eql(30);

//                 const statDateSecond = new Date(testStartTime).setSeconds(testStartTime.getSeconds() + 40);
//                 intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', runnerId, statDateSecond, 200));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.avg_rps).eql(20);

//                 const statDateThird = new Date(testStartTime).setSeconds(testStartTime.getSeconds() + 60);
//                 const doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', runnerId, statDateThird));
//                 should(doneStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 should(getReportResponse.statusCode).be.eql(200);
//                 report = getReportResponse.body;
//                 should(report.avg_rps).eql(13.33);

//                 // Verify assertions aggregation
//                 const getAggregatedReportResponse = await reportsRequestCreator.getAggregatedReport(testId, reportId);
//                 should(getAggregatedReportResponse.body.aggregate.assertions).eql({
//                     '/users': {
//                         'statusCode 201': {
//                             success: 0,
//                             fail: 594,
//                             failureResponses: {
//                                 200: 594
//                             }
//                         },
//                         'header content-type values equals json': {
//                             success: 100,
//                             fail: 494,
//                             failureResponses: {
//                                 'application/json; charset=utf-8': 494
//                             }
//                         },
//                         'hasHeader proxy-id': {
//                             success: 0,
//                             fail: 594,
//                             failureResponses: {
//                                 'response has no proxy-id header': 594
//                             }
//                         }
//                     },
//                     '/accounts': {
//                         'statusCode 201': {
//                             success: 80,
//                             fail: 0,
//                             failureResponses: {}
//                         },
//                         'hasHeader proxy-id': {
//                             success: 0,
//                             fail: 80,
//                             failureResponses: {
//                                 'response has no proxy-id header': 80
//                             }
//                         }
//                     }
//                 });
//             });

//             it('Post only "done" phase stats', async function () {
//                 const doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', runnerId));
//                 should(doneStatsResponse.statusCode).be.eql(204);
//                 const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 should(getReportResponse.statusCode).be.eql(200);
//                 const report = getReportResponse.body;
//                 validateFinishedReport(report);
//             });

//             it('Post done phase stats with benchmark data config for test', async () => {
//                 const benchmarkRequest = {
//                     rps: {
//                         count: 100,
//                         mean: 90.99
//                     },
//                     latency: { median: 357.2, p95: 1042 },
//                     errors: { errorTest: 1 },
//                     codes: { codeTest: 1 }
//                 };
//                 const config = {
//                     benchmark_threshold: 55,
//                     benchmark_weights: {
//                         percentile_ninety_five: { percentage: 20 },
//                         percentile_fifty: { percentage: 30 },
//                         server_errors_ratio: { percentage: 20 },
//                         client_errors_ratio: { percentage: 20 },
//                         rps: { percentage: 10 }
//                     }
//                 };
//                 const configRes = await configRequestCreator.updateConfig(config);
//                 should(configRes.statusCode).eql(200);
//                 const benchmarkRes = await testsRequestCreator.createBenchmark(testId, benchmarkRequest, {});
//                 should(benchmarkRes.statusCode).eql(201);
//                 const intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', runnerId));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 const doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', runnerId));
//                 should(doneStatsResponse.statusCode).be.eql(204);
//                 const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 const getLastReport = await reportsRequestCreator.getLastReports(25);
//                 should(getReportResponse.statusCode).be.eql(200);
//                 should(getLastReport.statusCode).be.eql(200);

//                 const report = getReportResponse.body;
//                 const lastReports = getLastReport.body.filter(report => report.report_id === reportId);
//                 const lastReport = lastReports[0];
//                 should(lastReport.report_id).eql(reportId);
//                 validateFinishedReport(report);
//                 should(report.score).eql(100);
//                 should(lastReport.score).eql(100);
//                 should(lastReport.benchmark_weights_data).eql(report.benchmark_weights_data);
//                 should(report.benchmark_weights_data).eql({
//                     benchmark_threshold: 55,
//                     rps: {
//                         benchmark_value: 90.99,
//                         report_value: 90.99,
//                         percentage: 0.1,
//                         score: 10
//                     },
//                     percentile_ninety_five: {
//                         benchmark_value: 1042,
//                         report_value: 1042,
//                         percentage: 0.2,
//                         score: 20
//                     },
//                     percentile_fifty: {
//                         benchmark_value: 357.2,
//                         report_value: 357.2,
//                         percentage: 0.3,
//                         score: 30
//                     },
//                     client_errors_ratio: {
//                         benchmark_value: 0,
//                         report_value: 0,
//                         percentage: 0.2,
//                         score: 20
//                     },
//                     server_errors_ratio: {
//                         benchmark_value: 0.01,
//                         report_value: 0,
//                         percentage: 0.2,
//                         score: 20
//                     }
//                 });
//             });

//             it('Post "error" stats', async function () {
//                 const phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', runnerId));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 let getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 let report = getReportResponse.body;
//                 should(report.status).eql('started');

//                 const intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', runnerId));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');

//                 const errorStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('error', runnerId));
//                 should(errorStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('failed');
//             });

//             it('Post "aborted" stats', async function () {
//                 const phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', runnerId));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 let getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 let report = getReportResponse.body;
//                 should(report.status).eql('started');

//                 const intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', runnerId));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');

//                 const abortedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('aborted', runnerId));
//                 should(abortedStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('aborted');
//                 validateFinishedReport(report, undefined, 'aborted');
//             });
//         });
//     });

//     describe('Happy flow - with parallelism', function () {
//         before(async function () {
//             if (!jobId) {
//                 const jobResponse = await createJob(testId);
//                 jobBody = jobResponse.body;
//                 jobId = jobResponse.body.id;
//             }
//         });
//         describe('Create report', function () {
//             it('should successfully create report on first call and only subscribe runner on second call', async function () {
//                 const reportBody = minimalReportBody;
//                 firstRunner = uuid();
//                 secondRunner = uuid();

//                 reportBody.job_id = jobId;
//                 reportBody.runner_id = firstRunner;
//                 let reportResponse = await reportsRequestCreator.createReport(testId, reportBody);
//                 should(reportResponse.statusCode).be.eql(201);

//                 reportBody.runner_id = secondRunner;
//                 reportResponse = await reportsRequestCreator.createReport(testId, reportBody);
//                 should(reportResponse.statusCode).be.eql(201);

//                 const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 const report = getReportResponse.body;
//                 should(report.status).eql('initializing');
//                 should(report.notes).eql(jobBody.notes);
//                 should(report.max_virtual_users).eql(jobBody.max_virtual_users);
//                 should(report.arrival_rate).eql(jobBody.arrival_rate);
//                 should(report.duration).eql(jobBody.duration);
//                 should(report.ramp_to).eql(jobBody.ramp_to);

//                 should(report.subscribers.length).eql(2);
//                 const firstSubscriber = report.subscribers.find((subscriber) => {
//                     if (subscriber.runner_id === firstRunner) {
//                         return subscriber;
//                     }
//                 });

//                 const secondSubscriber = report.subscribers.find((subscriber) => {
//                     if (subscriber.runner_id === firstRunner) {
//                         return subscriber;
//                     }
//                 });

//                 should.exist(firstSubscriber);
//                 should.exist(secondSubscriber);

//                 should(firstSubscriber.phase_status).eql(constants.SUBSCRIBER_INITIALIZING_STAGE);
//                 should(secondSubscriber.phase_status).eql(constants.SUBSCRIBER_INITIALIZING_STAGE);
//             });
//         });
//         describe('Create report, post stats, and get final report', function () {
//             it('should successfully create report', async function () {
//                 const reportBody = minimalReportBody;
//                 firstRunner = uuid();
//                 secondRunner = uuid();

//                 reportBody.job_id = jobId;
//                 reportBody.runner_id = firstRunner;
//                 let reportResponse = await reportsRequestCreator.createReport(testId, reportBody);
//                 should(reportResponse.statusCode).be.eql(201);

//                 reportBody.runner_id = secondRunner;
//                 reportResponse = await reportsRequestCreator.createReport(testId, reportBody);
//                 should(reportResponse.statusCode).be.eql(201);

//                 let getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 let report = getReportResponse.body;
//                 should(report.status).eql('initializing');

//                 let phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', firstRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('started');

//                 phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', secondRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('started');

//                 let intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', firstRunner));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');

//                 intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', secondRunner));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');
//                 should.not.exist(report.end_time);

//                 let doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', firstRunner));
//                 should(doneStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 should(getReportResponse.statusCode).be.eql(200);
//                 report = getReportResponse.body;
//                 should(report.status).eql('partially_finished');
//                 should.exist(report.end_time);

//                 doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', secondRunner));
//                 should(doneStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 should(getReportResponse.statusCode).be.eql(200);
//                 report = getReportResponse.body;
//                 validateFinishedReport(report);
//             });
//         });
//         describe('Post stats', function () {

//                 minimalReportBody.runner_id = firstRunner;
//                 let reportResponse = await reportsRequestCreator.createReport(testId, minimalReportBody);
//                 should(reportResponse.statusCode).be.eql(201);

//                 minimalReportBody.runner_id = secondRunner;
//                 reportResponse = await reportsRequestCreator.createReport(testId, minimalReportBody);
//                 should(reportResponse.statusCode).be.eql(201);
//             });

//             it('All runners post "done" stats - report finished', async function () {
//                 let doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', firstRunner));
//                 should(doneStatsResponse.statusCode).be.eql(204);

//                 doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', secondRunner));
//                 should(doneStatsResponse.statusCode).be.eql(204);

//                 const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 should(getReportResponse.statusCode).be.eql(200);
//                 const report = getReportResponse.body;
//                 validateFinishedReport(report);
//             });

//             it('All runners post "error" stats - report failed', async function () {
//                 let phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('error', firstRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 let getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 let report = getReportResponse.body;

//                 phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('error', secondRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('failed');
//             });

//             it('All runners post "aborted" stats - report aborted', async function () {
//                 let phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('aborted', firstRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 let getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 let report = getReportResponse.body;

//                 phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('aborted', secondRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('aborted');
//             });

//             it('One runner post "error" stats - report partially finished', async function () {
//                 let phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', firstRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 let getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 let report = getReportResponse.body;

//                 phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', secondRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('started');

//                 const intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', firstRunner));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');

//                 const errorStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('error', secondRunner));
//                 should(errorStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');

//                 const doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', firstRunner));
//                 should(doneStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('partially_finished');
//             });

//             it('One runner post "aborted" stats - report partially finished', async function () {
//                 let phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', firstRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 let getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 let report = getReportResponse.body;

//                 phaseStartedStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('started_phase', secondRunner));
//                 should(phaseStartedStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('started');

//                 const intermediateStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('intermediate', firstRunner));
//                 should(intermediateStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');

//                 const errorStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('aborted', secondRunner));
//                 should(errorStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('in_progress');

//                 const doneStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsGenerator.generateStats('done', firstRunner));
//                 should(doneStatsResponse.statusCode).be.eql(204);
//                 getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
//                 report = getReportResponse.body;
//                 should(report.status).eql('partially_finished');
//             });
//         });
//     });
// });

const jobPlatform = process.env.JOB_PLATFORM;
// I did this to save an indentation level
(jobPlatform.toUpperCase() === 'KUBERNETES' ? describe : describe.skip)('Reports integration tests', function() {
    before('Init requestCreators', async function() {
        await reportsRequestCreator.init();
        await testsRequestCreator.init();
        await jobRequestCreator.init();
        await configRequestCreator.init();
    });
    describe('Reports', function() {
        this.timeout(10000000);
        describe('Report Creation and Flow', function() {
            describe('Single runner', function() {
                it('should fetch a report successfully with correct values and status initialize with no runners subscribed and uner the time grace of initialization', async function () {
                    const jobName = 'jobName';
                    const id = uuid.v4();

                    nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                    const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                    expect(testCreateResponse.status).to.be.equal(201);

                    const testId = testCreateResponse.body.id;
                    const job = {
                        test_id: testId,
                        arrival_rate: 1,
                        duration: 1,
                        environment: 'test',
                        run_immediately: true,
                        type: 'load_test',
                        webhooks: [],
                        emails: []
                    };

                    const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                    expect(jobCreateResponse.status).to.be.equal(201);

                    const reportId = jobCreateResponse.body.run_id;
                    const jobId = jobCreateResponse.body.id;

                    const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
                    expect(getReportResponse.status).to.be.equal(200);
                    expect(getReportResponse.body).to.deep.contain({
                        status: 'initializing',
                        job_id: jobId,
                        report_id: reportId.toString(),
                        test_id: testId,
                        notes: '',
                        parallelism: 1,
                        phase: '0',
                        job_type: 'load_test',
                        arrival_rate: 1,
                        avg_rps: 0,
                        duration: 1,
                        environment: 'test',
                        is_favorite: false,
                        test_name: 'Create token and create customer',
                        test_type: 'basic'
                    });
                });
                it('should fetch a report successfully with status started after a runner subscribed and post stats of started phase', async function () {
                    const jobName = 'jobName';
                    const id = uuid.v4();

                    nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                    const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                    expect(testCreateResponse.status).to.be.equal(201);

                    const testId = testCreateResponse.body.id;
                    const job = {
                        test_id: testId,
                        arrival_rate: 1,
                        duration: 1,
                        environment: 'test',
                        run_immediately: true,
                        type: 'load_test',
                        webhooks: [],
                        emails: []
                    };

                    const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                    expect(jobCreateResponse.status).to.be.equal(201);

                    const reportId = jobCreateResponse.body.run_id;

                    await sleep(1 * 1000); // 1 seconds

                    const runnerId = uuid.v4();

                    const subscribeRunnerToReportResponse = await reportsRequestCreator.subscribeRunnerToReport(testId, reportId, runnerId);
                    expect(subscribeRunnerToReportResponse.status).to.be.equal(204);

                    const statsFromRunner = statsGenerator.generateStats(constants.SUBSCRIBER_STARTED_STAGE, runnerId);

                    const postStatsResponse = await reportsRequestCreator.postStats(testId, reportId, statsFromRunner);
                    expect(postStatsResponse.status).to.be.equal(204);

                    const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
                    expect(getReportResponse.status).to.be.equal(200);
                    expect(getReportResponse.body).to.have.property('status').and.to.be.equal(constants.REPORT_STARTED_STATUS);
                });
                it('should fetch a report successfully with status failed after a runner subscribed and aborted', async function() {
                    const jobName = 'jobName';
                    const id = uuid.v4();
                    const runnerId = uuid.v4();

                    nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                    const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                    expect(testCreateResponse.status).to.be.equal(201);

                    const testId = testCreateResponse.body.id;
                    const job = {
                        test_id: testId,
                        arrival_rate: 1,
                        duration: 1,
                        environment: 'test',
                        run_immediately: true,
                        type: 'load_test',
                        webhooks: [],
                        emails: []
                    };

                    const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                    expect(jobCreateResponse.status).to.be.equal(201);
                    const reportId = jobCreateResponse.body.run_id;

                    await assertRunnerSubscriptionToReport(testId, reportId, runnerId);
                    await assertPostStats(testId, reportId, runnerId, constants.REPORT_ABORTED_STATUS);
                    await assertReportStatus(testId, reportId, constants.REPORT_FAILED_STATUS);
                });
                it('should successfully create report - a complete happy flow cycle', async function () {
                    const jobName = 'jobName';
                    const id = uuid.v4();
                    const runnerId = uuid.v4();

                    nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                    const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                    expect(testCreateResponse.status).to.be.equal(201);

                    const testId = testCreateResponse.body.id;
                    const job = {
                        test_id: testId,
                        arrival_rate: 1,
                        duration: 1,
                        environment: 'test',
                        run_immediately: true,
                        type: 'load_test',
                        webhooks: [],
                        emails: []
                    };

                    const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                    expect(jobCreateResponse.status).to.be.equal(201);
                    const reportId = jobCreateResponse.body.run_id;

                    await sleep(1 * 1000); // 1 seconds
                    await runFullSingleRunnerCycle(testId, reportId, runnerId);
                });
                it('should fetch a report successfully with correct values and status initialize with no runners subscribed and uner the time grace of initialization - functional_test', async function() {
                    const jobName = 'jobName';
                    const id = uuid.v4();

                    nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                    const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                    expect(testCreateResponse.status).to.be.equal(201);

                    const testId = testCreateResponse.body.id;
                    const job = {
                        test_id: testId,
                        arrival_count: 10,
                        duration: 1,
                        environment: 'test',
                        run_immediately: true,
                        type: 'functional_test',
                        webhooks: [],
                        emails: []
                    };

                    const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                    expect(jobCreateResponse.status).to.be.equal(201);

                    const reportId = jobCreateResponse.body.run_id;
                    const jobId = jobCreateResponse.body.id;

                    const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
                    expect(getReportResponse.status).to.be.equal(200);
                    expect(getReportResponse.body).to.deep.contain({
                        status: 'initializing',
                        job_id: jobId,
                        report_id: reportId.toString(),
                        test_id: testId,
                        notes: '',
                        parallelism: 1,
                        phase: '0',
                        job_type: 'functional_test',
                        avg_rps: 0,
                        duration: 1,
                        environment: 'test',
                        is_favorite: false,
                        test_name: 'Create token and create customer',
                        test_type: 'basic'
                    });
                    expect(getReportResponse.body.arrival_rate).eql(undefined);
                });
            });
        });
        describe('editReport', function() {
            it('Create a report -> edit notes', async function() {
                const jobName = 'jobName';
                const id = uuid.v4();

                nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;
                const job = {
                    test_id: testId,
                    arrival_rate: 1,
                    duration: 1,
                    environment: 'test',
                    run_immediately: true,
                    type: 'load_test',
                    notes: 'cats',
                    webhooks: [],
                    emails: []
                };
                const newNote = 'dogs';

                const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                expect(jobCreateResponse.status).to.be.equal(201);

                const reportId = jobCreateResponse.body.run_id;

                const editReportResponse = await reportsRequestCreator.editReport(testId, reportId, { notes: newNote });
                expect(editReportResponse.status).to.be.equal(204);

                const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
                expect(getReportResponse.status).to.be.equal(200);
                expect(getReportResponse.body).to.have.property('notes').and.to.be.equal(newNote);
            });
            it('Create a report -> mark report as favorite', async function () {
                const jobName = 'jobName';
                const id = uuid.v4();

                nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;
                const job = {
                    test_id: testId,
                    arrival_rate: 1,
                    duration: 1,
                    environment: 'test',
                    run_immediately: true,
                    type: 'load_test',
                    notes: 'cats',
                    webhooks: [],
                    emails: []
                };

                const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                expect(jobCreateResponse.status).to.be.equal(201);

                const reportId = jobCreateResponse.body.run_id;

                const editReportResponse = await reportsRequestCreator.editReport(testId, reportId, { is_favorite: true });
                expect(editReportResponse.status).to.be.equal(204);

                const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
                expect(getReportResponse.status).to.be.equal(200);
                expect(getReportResponse.body).to.have.property('is_favorite').and.to.be.equal(true);
            });

            it('Create a report -> mark report as favorite and change the notes', async function () {
                const jobName = 'jobName';
                const id = uuid.v4();

                nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;
                const job = {
                    test_id: testId,
                    arrival_rate: 1,
                    duration: 1,
                    environment: 'test',
                    run_immediately: true,
                    type: 'load_test',
                    notes: 'cats',
                    webhooks: [],
                    emails: []
                };
                const newNote = 'dogs are my favorite';

                const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                expect(jobCreateResponse.status).to.be.equal(201);

                const reportId = jobCreateResponse.body.run_id;

                const editReportResponse = await reportsRequestCreator.editReport(testId, reportId, { is_favorite: true, notes: newNote });
                expect(editReportResponse.status).to.be.equal(204);

                const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
                expect(getReportResponse.status).to.be.equal(200);
                expect(getReportResponse.body).to.have.property('is_favorite').and.to.be.equal(true);
                expect(getReportResponse.body).to.have.property('notes').and.to.be.equal(newNote);
            });
        });
        describe('getReport', function() {
            it('Run a full cycle -> favorite report -> fetch report with is_favorite filter - should return the single created report', async function () {
                const jobName = 'jobName';
                const id = uuid.v4();
                const runnerId = uuid.v4();

                nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;
                const job = {
                    test_id: testId,
                    arrival_rate: 1,
                    duration: 1,
                    environment: 'test',
                    run_immediately: true,
                    type: 'load_test',
                    webhooks: [],
                    emails: []
                };

                const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                expect(jobCreateResponse.status).to.be.equal(201);
                const reportId = jobCreateResponse.body.run_id;

                await runFullSingleRunnerCycle(testId, reportId, runnerId);

                const editReportResponse = await reportsRequestCreator.editReport(testId, reportId, { is_favorite: true });
                expect(editReportResponse.status).to.be.equal(204);

                const createdReportResponse = await reportsRequestCreator.getReport(testId, reportId);
                expect(createdReportResponse.status).to.be.equal(200);

                const getReportsResponse = await reportsRequestCreator.getReports(testId, 'is_favorite');

                expect(getReportsResponse.body).to.be.an('array').and.to.have.lengthOf(1);
                expect(getReportsResponse.body[0]).to.have.property('is_favorite').and.to.be.equal(true);
                expect(getReportsResponse.body[0]).to.be.deep.equal(createdReportResponse.body);
            });
            it('Run 2 full cycles -> favorite reports -> fetch reports with is_favorite filter - should return the 2 created report', async function () {
                const jobName = 'jobName';
                const id = uuid.v4();
                const firstRunnerId = uuid.v4();
                const secondRunnerId = uuid.v4();

                nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;
                const job = {
                    test_id: testId,
                    arrival_rate: 1,
                    duration: 1,
                    environment: 'test',
                    run_immediately: true,
                    type: 'load_test',
                    webhooks: [],
                    emails: []
                };

                const firstJobCreateResponse = await jobRequestCreator.createJob(job, headers);
                expect(firstJobCreateResponse.status).to.be.equal(201);
                const firstReportId = firstJobCreateResponse.body.run_id;

                nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);
                const secondJobCreateResponse = await jobRequestCreator.createJob(job, headers);
                expect(secondJobCreateResponse.status).to.be.equal(201);
                const secondReportId = secondJobCreateResponse.body.run_id;

                await runFullSingleRunnerCycle(testId, firstReportId, firstRunnerId);
                await runFullSingleRunnerCycle(testId, secondReportId, secondRunnerId);

                const editFirstReportResponse = await reportsRequestCreator.editReport(testId, firstReportId, { is_favorite: true });
                expect(editFirstReportResponse.status).to.be.equal(204);

                const editSecondReportResponse = await reportsRequestCreator.editReport(testId, secondReportId, { is_favorite: true });
                expect(editSecondReportResponse.status).to.be.equal(204);

                const firstCreatedReportResponse = await reportsRequestCreator.getReport(testId, firstReportId);
                expect(firstCreatedReportResponse.status).to.be.equal(200);

                const secondCreatedReportResponse = await reportsRequestCreator.getReport(testId, secondReportId);
                expect(secondCreatedReportResponse.status).to.be.equal(200);

                const getReportsResponse = await reportsRequestCreator.getReports(testId, 'is_favorite');

                expect(getReportsResponse.body).to.be.an('array').and.to.have.lengthOf(2);
                expect(getReportsResponse.body[1]).to.have.property('is_favorite').and.to.be.equal(true);
                expect(getReportsResponse.body[1]).to.be.deep.equal(firstCreatedReportResponse.body);
                expect(getReportsResponse.body[0]).to.have.property('is_favorite').and.to.be.equal(true);
                expect(getReportsResponse.body[0]).to.be.deep.equal(secondCreatedReportResponse.body);
            });
        });
        describe('deleteReport', async function() {
            it('Create a report -> delete it -> fetch it -> should return 404', async function() {
                const jobName = 'jobName';
                const id = uuid.v4();
                const runnerId = uuid.v4();

                nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;
                const job = {
                    test_id: testId,
                    arrival_rate: 1,
                    duration: 1,
                    environment: 'test',
                    run_immediately: true,
                    type: 'load_test',
                    webhooks: [],
                    emails: []
                };

                const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                expect(jobCreateResponse.status).to.be.equal(201);
                const reportId = jobCreateResponse.body.run_id;

                await runFullSingleRunnerCycle(testId, reportId, runnerId);

                const deleteResponse = await reportsRequestCreator.deleteReport(testId, reportId);
                expect(deleteResponse.status).to.be.equal(204);

                const getResponse = await reportsRequestCreator.getReport(testId, reportId);
                expect(getResponse.status).to.be.equal(404);
            });
            it('Delete report which is in progress', async function () {
                const jobName = 'jobName';
                const id = uuid.v4();
                const runnerId = uuid.v4();

                nockK8sRunnerCreation(kubernetesConfig.kubernetesUrl, jobName, id, kubernetesConfig.kubernetesNamespace);

                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;
                const job = {
                    test_id: testId,
                    arrival_rate: 1,
                    duration: 1,
                    environment: 'test',
                    run_immediately: true,
                    type: 'load_test',
                    webhooks: [],
                    emails: []
                };

                const jobCreateResponse = await jobRequestCreator.createJob(job, headers);
                expect(jobCreateResponse.status).to.be.equal(201);
                const reportId = jobCreateResponse.body.run_id;

                const deleteRunningTestResponse = await reportsRequestCreator.deleteReport(testId, reportId);
                expect(deleteRunningTestResponse.status).to.be.equal(409);
                expect(deleteRunningTestResponse.body).to.be.deep.equal({
                    message: "Can't delete running test with status initializing"
                });
            });
        });
    });
    describe('Sad flow', function() {
        describe('editReport', function() {
            it('when report id does not exist - should return 404', async function () {
                const reportId = Date.now();
                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;

                const editReportResponse = await reportsRequestCreator.editReport(testId, reportId, { notes: 'some text' });
                expect(editReportResponse.status).eql(404);
                expect(editReportResponse.body).to.be.deep.equal({
                    message: 'Report not found'
                });
            });
        });
        describe('getReport', function() {
            it('GET not existing report', async function () {
                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;

                const getReportResponse = await reportsRequestCreator.getReport(testId, uuid.v4());
                expect(getReportResponse.status).to.be.equal(404);
                expect(getReportResponse.body).to.be.deep.equal({
                    message: 'Report not found'
                });
            });
        });

        describe('postStats', function() {
            it('POST stats on not existing report', async function () {
                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;

                const postStatsresponse = await reportsRequestCreator.postStats(testId, uuid(), statsGenerator.generateStats('started_phase', uuid()));
                expect(postStatsresponse.status).to.be.equal(404);
                expect(postStatsresponse.body).to.be.deep.equal({
                    message: 'Report not found'
                });
            });
        });
    });
    describe('Bad flow', function() {
        describe('editReport', function() {
            it('when edit additional properties that not include in the swagger', async function () {
                const reportId = Date.now();
                const testCreateResponse = await testsRequestCreator.createTest(basicTest, headers);
                expect(testCreateResponse.status).to.be.equal(201);

                const testId = testCreateResponse.body.id;

                const editReportResponse = await reportsRequestCreator.editReport(testId, reportId, { additional: 'add' });
                expect(editReportResponse.status).to.be.equal(400);
                expect(editReportResponse.body).to.be.deep.equal({
                    message: 'Input validation error',
                    validation_errors: [
                        "body should NOT have additional properties 'additional'"
                    ]
                });
            });
        });
        describe('lastReports', function() {
            it('GET last reports without limit query param', async function () {
                const lastReportsResponse = await reportsRequestCreator.getLastReports();
                expect(lastReportsResponse.status).to.be.equal(400);
                expect(lastReportsResponse.body).to.be.deep.equal({
                    message: 'Input validation error',
                    validation_errors: [
                        'query/limit should be integer'
                    ]
                });
            });

            it('GET last reports without limit query param', async function () {
                const lastReportsResponse = await reportsRequestCreator.getLastReports();
                expect(lastReportsResponse.status).to.be.equal(400);
                expect(lastReportsResponse.body).to.be.deep.equal({
                    message: 'Input validation error',
                    validation_errors: [
                        'query/limit should be integer'
                    ]
                });
            });

            it('GET last reports without limit query param', async function () {
                const lastReportsResponse = await reportsRequestCreator.getLastReports();
                expect(lastReportsResponse.status).to.be.equal(400);
                expect(lastReportsResponse.body).to.be.deep.equal({
                    message: 'Input validation error',
                    validation_errors: [
                        'query/limit should be integer'
                    ]
                });
            });
        });
        describe('postStats', function () {
            it('POST stats with bad request body', async function () {
                const postStatsResponse = await reportsRequestCreator.postStats(uuid(), uuid(), {});
                expect(postStatsResponse.status).to.be.equal(400);
                expect(postStatsResponse.body).to.be.deep.equal({
                    message: 'Input validation error',
                    validation_errors: [
                        'body should have required property \'stats_time\'',
                        'body should have required property \'phase_status\'',
                        'body should have required property \'data\''
                    ]
                });
            });

            it('POST stats with bad request body', async function () {
                const postStatsResponse = await reportsRequestCreator.postStats(uuid(), uuid(), {});
                expect(postStatsResponse.status).to.be.equal(400);
                expect(postStatsResponse.body).to.be.deep.equal({
                    message: 'Input validation error',
                    validation_errors: [
                        'body should have required property \'stats_time\'',
                        'body should have required property \'phase_status\'',
                        'body should have required property \'data\''
                    ]
                });
            });

            it('POST stats with bad request body', async function () {
                const postStatsResponse = await reportsRequestCreator.postStats(uuid(), uuid(), {});
                expect(postStatsResponse.status).to.be.equal(400);
                expect(postStatsResponse.body).to.be.deep.equal({
                    message: 'Input validation error',
                    validation_errors: [
                        'body should have required property \'stats_time\'',
                        'body should have required property \'phase_status\'',
                        'body should have required property \'data\''
                    ]
                });
            });
        });
    });
});

function nockK8sRunnerCreation(url, name, uid, namespace) {
    nock(url).post(`/apis/batch/v1/namespaces/${namespace}/jobs`)
        .reply(200, {
            metadata: { name, uid },
            namespace: namespace
        });
}

async function sleep(timeInMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeInMs);
    });
}

async function assertReportStatus(testId, reportId, status) {
    const getReportResponse = await reportsRequestCreator.getReport(testId, reportId);
    expect(getReportResponse.status).to.be.equal(200);
    expect(getReportResponse.body).to.have.property('status').and.to.be.equal(status);
}

async function assertPostStats(testId, reportId, runnerId, status) {
    const statsFromRunnerDone = statsGenerator.generateStats(status, runnerId);

    const postStatsRunnerDone = await reportsRequestCreator.postStats(testId, reportId, statsFromRunnerDone);
    expect(postStatsRunnerDone.status).to.be.equal(204);
}

async function assertRunnerSubscriptionToReport(testId, reportId, runnerId) {
    const subscribeRunnerToReportResponse = await reportsRequestCreator.subscribeRunnerToReport(testId, reportId, runnerId);
    expect(subscribeRunnerToReportResponse.status).to.be.equal(204);
}

async function runFullSingleRunnerCycle(testId, reportId, runnerId) {
    await assertRunnerSubscriptionToReport(testId, reportId, runnerId);
    await assertReportStatus(testId, reportId, constants.REPORT_INITIALIZING_STATUS);
    await assertPostStats(testId, reportId, runnerId, constants.SUBSCRIBER_STARTED_STAGE);
    await assertReportStatus(testId, reportId, constants.REPORT_STARTED_STATUS);
    await assertPostStats(testId, reportId, runnerId, constants.SUBSCRIBER_INTERMEDIATE_STAGE);
    await assertReportStatus(testId, reportId, constants.REPORT_IN_PROGRESS_STATUS);
    await assertPostStats(testId, reportId, runnerId, constants.SUBSCRIBER_DONE_STAGE);
    await assertReportStatus(testId, reportId, constants.REPORT_FINISHED_STATUS);
}
