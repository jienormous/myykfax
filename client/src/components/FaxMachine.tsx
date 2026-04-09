export function FaxMachine({ size = 300 }: { size?: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <img
        src="/fax-machine.png"
        alt="Myykfax 3000"
        width={size}
        style={{ maxWidth: "100%" }}
      />
    </div>
  );
}
