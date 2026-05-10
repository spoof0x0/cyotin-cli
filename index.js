#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

const program = new Command();
const filePath = path.join(process.cwd(), 'data', 'writeups.json');

const vulnerabilities = [
  "SQL Injection",
  "XSS",
  "CSRF",
  "SSRF",
  "RCE",
  "IDOR / Broken Access Control",
  "Authentication Bypass",
  "Authorization / Privilege Escalation",
  "Directory Traversal / LFI/RFI",
  "Command Injection",
  "Insecure Deserialization",
  "Business Logic",
  "Information Disclosure",
  "Path/Route Confusion",
  "Race Condition"
];

const STATUS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done'
};

export const saveWriteup = (data) => {
  let existingData = [];

  // 1. check file exists
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    existingData = fileContent ? JSON.parse(fileContent) : [];
  } else {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  existingData.push(data);

  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

  return data;
};

program
  .version('1.0.0')
  .description('CLI tool to add to notion');

program
  .command('list')
  .description('Show all writeups')
  .action(() => {
    const data = getAllWriteups();

    if (data.length === 0) {
      console.log('No writeups found 😅');
      return;
    }

    console.log('\n=== WRITEUPS ===\n');

    data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Vulnerability: ${item.vulnerability}`);
      console.log(`   Summary: ${item.summary}`);
      if (item.completedAt) {
        console.log(`   Done at: ${item.completedAt}`);
      }
      console.log('----------------------');
    });
  });

program
  .command('add-writeup')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the url/title of the writeup:'
      },
      {
        type: 'input',
        name: 'summary',
        message: 'Enter a summary of the writeup:'
      },
      {
        type: 'list',
        name: 'vulnerability',
        message: 'Select the vulnerability type:',
        choices: vulnerabilities
      },
      {
        type: 'list',
        name: 'status',
        message: 'Select the status:',
        choices: Object.values(STATUS)
      }
    ]);

    if (answers.status === STATUS.DONE) {
      answers.completedAt = new Date().toISOString().split('T')[0];
    }

    console.log('Adding writeup to Notion...');
    console.log(answers);
    await saveWriteup(answers);
    console.log('Saved locally 🚀');
  });

export const getAllWriteups = () => {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');

  if (!fileContent) {
    return [];
  }

  return JSON.parse(fileContent);
};

program.parse(process.argv);