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
            <div className={styles.definitions}>{entry.definitions}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Entries;
