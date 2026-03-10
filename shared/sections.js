// shared/sections.js
//
// Section registry. Collects section definitions from all services.
// In the fully converted system (Stage 6+), sections are derived
// directly from services.map(s => s.section). This registry is a
// transitional utility for the dual-loader period.

var sections = [];

function registerSection(section) {
    sections.push(section);
}

function getSections() {
    return sections;
}

module.exports = { sections, registerSection, getSections };
