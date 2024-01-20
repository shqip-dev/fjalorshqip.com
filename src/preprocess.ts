import * as fs from 'fs';

type OriginalDictionaryEntry = {
    term: string;
    definition: string[];
};

type IntermediateDictionaryEntry = {
    attributes: string[];
    definitions: string[];
}

type DictionaryEntry = {
    term: string;
    versions: IntermediateDictionaryEntry[];
}

const developmentSubSet = ['ACAR', 'AERONAUTIKË', 'ÇLIRUES', 'HYRJE', 'IKACAKE', 'PUPË IV'];

const production = process.env.NODE_ENV == 'production';

const fileContent = fs.readFileSync('data/dictionary.json', 'utf-8');
const dictionaryEntries: OriginalDictionaryEntry[] = JSON.parse(fileContent);
const temp: { [key: string]: IntermediateDictionaryEntry[] } = {};

dictionaryEntries.forEach((entry) => {
    const originalTermParts = entry.term.split(/\s+/).map(term => term.trim()).filter(term => term !== '');

    const term = originalTermParts.filter(part => !part.endsWith('.')).join(' ');
    const attributes = originalTermParts.filter(part => part.endsWith('.'));

    let definitions = entry.definition.map(definition => definition.trim());
    if (definitions.length > 1) {
        definitions = definitions.map(definition => definition.replace(/^\d+\.\s*/, ''));
    }

    if (!temp[term]) {
        temp[term] = [];
    }
    temp[term].push({
        attributes,
        definitions,
    });
});

const filteredEntries = production ? Object.entries(temp) : Object.entries(temp).filter(([key]) => developmentSubSet.includes(key));

const result: DictionaryEntry[] = filteredEntries.map(([key, value]) => ({
    term: key,
    versions: value,
}));

fs.mkdirSync('src/data/', { recursive: true });
fs.writeFileSync('src/data/dictionary.json', JSON.stringify(result, null, 2));

console.debug(`Generated ${filteredEntries.length} entries`);
