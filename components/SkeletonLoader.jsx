export default function SkeletonLoader({ count = 3, height = 68 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-loading"
          style={{
            height,
            width: '100%',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
          }}
        />
      ))}
    </div>
  );
}
