import React, { useState } from 'react';
import { HighlightedTextarea } from './components/HighlightedTextarea';
import { validateExpression } from './utils/validateExpression';
import { Alert } from 'antd';


const App: React.FC = () => {
  const [expr, setExpr] = useState('');
  const error = validateExpression(expr);
  return (
    <div style={{ padding: 20 }}>
      <h2>Введите логическое выражение</h2>
      <HighlightedTextarea
        value={expr}
        placeholder='Например: TI="Kaspersky AND Lab" OR AB="Avast"'
        onChange={setExpr}
      />
      <div style={{ marginTop: 16 }}>
        {error ? (
          <Alert type="error" message={`Ошибка: ${error}`} showIcon />
        ) : (
          expr && <Alert type="success" message="Выражение корректно" showIcon />
        )}
      </div>
    </div>
   
  );
};

export default App;