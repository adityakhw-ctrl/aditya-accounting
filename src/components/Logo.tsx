export function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/favicon.ico"
      alt="Aditya Accounting Logo"
      width={size}
      height={size}
      style={{ borderRadius: "8px", objectFit: "contain" }}
    />
  );
}
