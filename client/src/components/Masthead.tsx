export function Masthead({ sub }: { sub?: string }) {
  return (
    <>
      <div className="masthead">
        <p className="masthead-sub">{sub ?? "Trufax Compendium"}</p>
        <h1 className="masthead-title">MYYKFAX</h1>
        <p className="masthead-serial">UNIT SN: MF2026-MYYK</p>
      </div>
      <div className="masthead-rule" />
    </>
  );
}
