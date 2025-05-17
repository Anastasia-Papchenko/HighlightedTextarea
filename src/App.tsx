import React, { useState } from 'react';
import { HighlightedTextarea } from './components/HighlightedTextarea';
import { validateExpression } from './utils/validateExpression';
import { Alert, Row, Col, Card, Tag, Space, Divider, Typography } from 'antd';

 const { Title } = Typography;

 const correctExamples = [
   `"antivirus"`,
   `TI="Kaspersky"`,
   `"anti" AND "fir"`,
   `(TI="K" OR AB="A") AND NOT (DP="2" OR URL="*.com")`,
   `""`,
   `''`,
   `'endpoint' OR 'server'`
 ];

 const incorrectExamples = [
   `TI="A" AB="B"`,
   `"a" AND`,
   `(AB="X" OR TI="Y"`,
   `AB="X") AND TI="Y"`,
   `"text" AND DP="2021"`,
   `antivirus OR ???`,
   `wsdf`,
   `AND "a"`,
   `"a" OR OR "b"`
 ];

const App: React.FC = () => {
  const [expr, setExpr] = useState('');
  const error = validateExpression(expr);

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>Примеры выражений</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} className="expr-col">
          <Card size="small" title={<span style={{ color: 'green' }}>Корректные</span>}>
            <Space wrap size={[8, 8]}>
              {correctExamples.map((ex, i) => (
                <Tag key={i} color="default" style={{ userSelect: 'all' }}>
                  {ex}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} className="expr-col">
          <Card size="small" title={<span style={{ color: 'red' }}>Некорректные</span>}>
            <Space wrap size={[8, 8]}>
              {incorrectExamples.map((ex, i) => (
                <Tag key={i} color="default" style={{ userSelect: 'all' }}>
                  {ex}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Title level={2}>Введите логическое выражение</Title>
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