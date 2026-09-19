import type { Entry } from '../../lib/dictionary';
import {
  formatDefinition,
  getHomographMark,
  type Neighbour,
  type Part,
} from '../../lib/entryFormat';
import styles from './Entries.module.scss';

const MANY_SENSES = 6;

interface EntriesProps {
  entries: Entry[];
  prev?: Neighbour | null;
  next?: Neighbour | null;
}

const Parts = ({ parts }: { parts: Part[] }) => (
  <>
    {parts.map((part, idx) =>
      part.kind === 'ref' ? (
        <a key={idx} href={`/f/${part.slug}`} className={`${styles.ref} sc`}>
          {part.text}
        </a>
      ) : (
        <span key={idx}>{part.text}</span>
      )
    )}
  </>
);

const Entries = ({ entries = [], prev, next }: EntriesProps) => {
  if (entries.length === 0) {
    return null;
  }

  const headword = entries[0].term;
  const homographs = entries.length > 1;

  return (
    <article className={styles.entry}>
      {(prev || next) && (
        <nav className="guide" aria-label="Fjalët fqinje">
          {prev ? (
            <a href={`/f/${prev.slug}`} rel="prev">
              {prev.term}
            </a>
          ) : (
            <span className={styles.railEnd}>{headword}</span>
          )}

          <span className={styles.guideLeader} aria-hidden="true" />

          {next ? (
            <a href={`/f/${next.slug}`} rel="next">
              {next.term}
            </a>
          ) : (
            <span className={styles.railEnd}>{headword}</span>
          )}
        </nav>
      )}

      <h1 className={styles.headword}>{headword}</h1>

      {entries.map((entry, entryIdx) => {
        const senses = entry.definitions.map(formatDefinition);

        return (
          <section key={`entry-${entryIdx}`} className={styles.version}>
            <div className={styles.versionHead}>
              {homographs && (
                <span className={`${styles.mark} sc`}>
                  {getHomographMark(entryIdx)}
                </span>
              )}
              {entry.term !== headword && (
                <span className={styles.variant}>{entry.term}</span>
              )}
              {entry.attributes.length !== 0 && (
                <span className={styles.labels}>
                  {entry.attributes.join(' ')}
                </span>
              )}
            </div>

            <ol
              className={[
                styles.senses,
                senses.length === 1 ? styles.single : '',
                senses.length >= MANY_SENSES ? styles.columns : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {senses.map((sense, senseIdx) => (
                <li key={`sense-${senseIdx}`} className={styles.sense}>
                  <Parts parts={sense.sense} />

                  {sense.idioms.length !== 0 && (
                    <div className={styles.idioms}>
                      <h2 className={`${styles.idiomsTitle} sc`}>Shprehje</h2>
                      <ul>
                        {sense.idioms.map((idiom, idiomIdx) => (
                          <li key={`idiom-${idiomIdx}`} className={styles.idiom}>
                            <Parts parts={idiom} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </article>
  );
};

export default Entries;
