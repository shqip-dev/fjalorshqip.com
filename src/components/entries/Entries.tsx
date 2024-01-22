import type { Entry } from '../../lib/dictionary';
import styles from './Entries.module.scss';

interface EntriesProps {
  entries: Entry[];
}

const Entries = ({ entries = [] }: EntriesProps) => {
  return (
    <div className={styles.entries}>
      {entries.map((entry, idx) => {
        return (
          <div key={`entry-${idx}`}>
            <span className={styles.title}>{entry.term}</span>{' '}
            <span className={styles.attributes}>{entry.attributes}</span>
            <br />
            {entry.definitions.map((definition, idx) => (
              <div key={`def-${idx}`} className={styles.definition}>
                {entry.definitions.length > 1 ? `${idx + 1}. ` : ''}
                {definition}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default Entries;
