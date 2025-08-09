import { Given, Then } from '@cucumber/cucumber';

Given('I start the test', async function() {
  console.log('Test started!');
});

Then('the test succeeds', async function() {
  console.log('Test succeeded!');
});