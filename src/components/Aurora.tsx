import '../styles/aurora.css';

/** Shared purple background (same look as Hero / About). Put it as the first child of a `position: relative` section. */
export function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <span className="aurora__blob aurora__blob--a" />
      <span className="aurora__blob aurora__blob--b" />
      <span className="aurora__arc aurora__arc--a" />
      <span className="aurora__arc aurora__arc--b" />
      <span className="aurora__grid" />
      <span className="aurora__grain" />
    </div>
  );
}