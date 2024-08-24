import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';

const COLORS = ['#14b32b', '#f2b93d', '#1356ad', '#f06813', '#eb34b4', '#47c4ed', '#59f0cf', '#f0ec18'];

function CustomizedLabel(props){
  const {x, y, value, index, sum} = props;
  const percentage = ((value / sum) * 100).toFixed(2);

  return (
    <g>
      <text x={x + 10} y={y - 10} textAnchor="middle">
        <tspan x={x + 10} dy="0">{value}</tspan>
        <tspan x={x + 10} dy="20">{`${percentage}%`}</tspan>
      </text>
    </g>
  )
}

export default function WorkDistributionBarChart({ workDistributionStats }){
  const [workDistributionData, setWorkDistributionData] = useState([]);

  useEffect(() => {
    if (workDistributionStats) {
      setWorkDistributionData(workDistributionStats);
      console.log('workDistributionStats', workDistributionStats);
    }
  }, [workDistributionStats]);

  if (!workDistributionData || workDistributionData.length === 0) {
    return <p>Loading...</p>;
  }

  const value = workDistributionData.map(item => item.totalHours);
  const sum = value.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  console.log(sum);
  
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={400} minHeight={430}>
      <BarChart
        data = {workDistributionData}
        barCategoryGap = '20%'
      >
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="totalHours"
          fill="#8884d8"
          legendType='none'
          label={<CustomizedLabel sum={sum} />}
          // label={{ position: 'top' }} // this can only show the value
        >
          {workDistributionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % 20]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}