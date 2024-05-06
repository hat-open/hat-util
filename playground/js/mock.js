import { JSDOM } from 'jsdom';

const { window } = new JSDOM();
global.document = window.document;
