
const { useState, useEffect, useMemo } = React;

const LS_KEY = 'bead-rope-data-v2';

const defaultCheatsheet = [
  { brand: 'Preciosa 10/0', pivstovchyk: 28, stovpchyk: 26 },
  { brand: 'Miyuki delica 11/0', pivstovchyk: 40, stovpchyk: 35 },
  { brand: 'Miyuki RR 11/0', pivstovchyk: 35, stovpchyk: 33 },
  { brand: 'Miyuki RR 15/0', pivstovchyk: 48, stovpchyk: 45 },
];

function number(v, fallback = 0) {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function saveLS(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function loadLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || null; }
  catch { return null; }
}

function Row({label, hint, value, onChange, unit, readOnly, placeholder}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center py-2">
      <div className="md:col-span-6 text-sm md:text-base">
        <div className="font-medium">{label}</div>
        {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
      </div>
      <div className="md:col-span-4">
        <input
          type="number"
          step="any"
          className={`w-full rounded-2xl card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand ${readOnly ? 'opacity-85' : ''}`}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      </div>
      <div className="md:col-span-2 text-right text-sm opacity-80">{unit || ''}</div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-700 my-4"></div>;
}

function App() {
  const persisted = loadLS();

  const [inputs, setInputs] = useState(persisted?.inputs || {
    A: '', // довжина виробу, см
    B: '', // рядів у 5 см
    C: '', // рядів у рапорті
    D: '', // бісерин в колі (в рядку)
  });

  const [cheatsheet, setCheatsheet] = useState(persisted?.cheatsheet || defaultCheatsheet);

  useEffect(() => { saveLS({ inputs, cheatsheet }); }, [inputs, cheatsheet]);

  const A = number(inputs.A);
  const B = number(inputs.B);
  const C = number(inputs.C);
  const D = number(inputs.D);

  // Формули відповідно до останнього скріна:
  const E = useMemo(() => B/5, [B]);              // E = B/5
  const F = useMemo(() => A * E, [A, E]);         // F = A*E
  const G = useMemo(() => (A !== 0 ? F / A : 0), [F, A]); // G = F/A
  const H = useMemo(() => (F - C) / 2, [F, C]);   // H = (F - C)/2
  const I = useMemo(() => H * D, [H, D]);         // I = H * D
  const J = useMemo(() => F * D, [F, D]);         // J = F * D
  const K = useMemo(() => J / 40, [J]);           // K = J / 40
  const L = useMemo(() => J / 200, [J]);          // L = J / 200

  const upd = (k, v) => setInputs(s => ({...s, [k]: v}));
  const fmt = (v) => Number.isFinite(v) ? (Math.round(v * 100) / 100) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Калькулятор для розрахунку довжини джгутів
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">
          Заповни лише виділені поля. Формули приховані — значення рахуються автоматично.
          Дані зберігаються локально (offline/PWA).
        </p>
      </header>

      <section className="card rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="grid grid-cols-1">
          <Row
            label="Необхідна довжина готового виробу (A)"
            hint="Вкажи довжину у сантиметрах."
            unit="см"
            value={inputs.A}
            onChange={(v)=>upd('A', v)}
            placeholder="Введіть довжину виробу"
          />
          <Row
            label="Кількість рядів у 5 см виробу (B)"
            hint="Виміряй 5 см виробу або скористайся шпаргалкою нижче."
            unit="рядів"
            value={inputs.B}
            onChange={(v)=>upd('B', v)}
            placeholder="Скільки рядів у 5 см"
          />
          <Row
            label="Рядів у рапорті за схемою (C)"
            unit="рядів"
            value={inputs.C}
            onChange={(v)=>upd('C', v)}
            placeholder="Рядів у рапорті"
          />
          <Row
            label="Бісерин в одному ряду/колі (D)"
            hint="Скільки бісерин у поперечному колі джгута."
            unit="шт"
            value={inputs.D}
            onChange={(v)=>upd('D', v)}
            placeholder="Бісерин у колі"
          />

          <Divider />

          <Row label="Рядів у 1 см (E = B/5)" value={fmt(E)} readOnly unit="рядів" />
          <Row label="Загальна кількість рядів (F = A × E)" value={fmt(F)} readOnly unit="рядів" />
          <Row label="G = F / A" value={fmt(G)} readOnly unit="" />
          <Row label="Потрібно додати РЯДКІВ з кожного боку (H = (F − C)/2)" value={fmt(H)} readOnly unit="рядів" />
          <Row label="Потрібно додати БІСЕРИН з кожного боку (I = H × D)" value={fmt(I)} readOnly unit="шт" />
          <Row label="Загальна кількість бісерин (J = F × D)" value={fmt(J)} readOnly unit="шт" />
          <Row label="Необхідна вага бісеру (Preciosa 10/0): K = J / 40" value={fmt(K)} readOnly unit="г" />
          <Row label="Необхідна вага бісеру (Delica 11/0): L = J / 200" value={fmt(L)} readOnly unit="г" />
        </div>
      </section>

      <section className="card rounded-2xl p-4 md:p-6 shadow-xl mt-6">
        <p className="text-sm">
          Знаходь класні схеми бісероплетіння тут —{' '}
          <a className="text-brand underline" href="http://t.me/hochubiser" target="_blank" rel="noreferrer">t.me/hochubiser</a>
        </p>
        <p className="text-sm mt-2">Слава Україні!</p>
      </section>

      <section className="mt-8 card rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Шпаргалка: приблизна к-сть рядів у 5 см</h2>
          <button
            className="px-3 py-2 rounded-xl bg-brand/20 hover:bg-brand/30 transition border border-brand/40 text-brand"
            onClick={() => setCheatsheet(defaultCheatsheet)}
            title="Відновити значення за замовчуванням"
          >
            Скинути до стандартних
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Редагуй комірки й підставляй у (B) одним кліком.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2">Бренд/Формат</th>
                <th className="px-3 py-2">Півстовпчик</th>
                <th className="px-3 py-2">Стовпчик</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
            {cheatsheet.map((row, idx) => (
              <tr key={idx} className="border-t border-gray-700">
                <td className="px-3 py-2">
                  <InlineEdit value={row.brand} onChange={(v)=>editRow(idx, {brand:v})} />
                </td>
                <td className="px-3 py-2">
                  <InlineEdit value={row.pivstovchyk} type="number" onChange={(v)=>editRow(idx, {pivstovchyk:number(v, row.pivstovchyk)})} />
                </td>
                <td className="px-3 py-2">
                  <InlineEdit value={row.stovpchyk} type="number" onChange={(v)=>editRow(idx, {stovpchyk:number(v, row.stovpchyk)})} />
                </td>
                <td className="px-3 py-2">
                  <button
                    className="px-3 py-1 rounded-lg bg-brand/20 border border-brand/40 text-brand hover:bg-brand/30"
                    onClick={() => setInputs(s => ({...s, B: row.pivstovchyk}))}
                  >Підставити (B)</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} BeadRopeCalc v2 · PWA · GitHub Pages ready
      </footer>
    </div>
  );

  function editRow(index, patch) {
    setCheatsheet(list => list.map((r,i)=> i===index ? {...r, ...patch} : r));
  }
}

function InlineEdit({value, onChange, type='text'}){
  const [v, setV] = useState(value);
  const [editing, setEditing] = useState(false);
  useEffect(()=> setV(value), [value]);
  return (
    <div>
      {editing ? (
        <input
          className="rounded-lg card px-2 py-1 w-full"
          type={type}
          autoFocus
          value={v}
          onChange={e=>setV(e.target.value)}
          onBlur={()=>{ setEditing(false); onChange?.(v); }}
          onKeyDown={(e)=>{
            if (e.key === 'Enter') { setEditing(false); onChange?.(v); }
            if (e.key === 'Escape') { setEditing(false); setV(value); }
          }}
        />
      ) : (
        <button className="text-left hover:underline" onClick={()=>setEditing(true)}>
          {String(value)}
        </button>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
