import React, { useState, useMemo } from 'react';
import {
  Paper,
  Title,
  TextInput,
  Grid,
  Container,
  Table,
  Stack
} from '@mantine/core';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const SIPCalculator = () => {
  const [formData, setFormData] = useState({
    initialInvestment: 100000,
    monthlySIP: 10000,
    annualStepUp: 10,
    totalYears: 10,
    expectedReturn: 12
  });

  const calculateSIPReturns = (data) => {
    const {
      initialInvestment, // Lumpsum amount
      monthlySIP,        // Monthly SIP amount
      annualStepUp,      // Yearly percentage increase in SIP
      totalYears,        // Investment duration in years
      expectedReturn     // Annual return rate in percentage
    } = data;
  
    // Calculate monthly interest rate
    const monthlyRate = expectedReturn / 12 / 100;
    
    let yearlyData = [];
    let currentSIP = monthlySIP;
    let totalInvested = initialInvestment;
    let totalValue = initialInvestment;
    
    // Iterate through each year
    for (let year = 1; year <= totalYears; year++) {
      // For each month in the year
      for (let month = 1; month <= 12; month++) {
        // First compound the existing amount
        totalValue *= (1 + monthlyRate);
        
        // Then add the SIP amount
        totalValue += currentSIP;
        totalInvested += currentSIP;
      }
      
      // Store yearly data
      yearlyData.push({
        year,
        sipAmount: Math.round(currentSIP),
        totalInvested: Math.round(totalInvested),
        estimatedReturn: Math.round(totalValue - totalInvested),
        totalValue: Math.round(totalValue),
        xirr: calculateXIRR(totalValue, totalInvested, year)
      });
      
      // Increase SIP amount for next year
      currentSIP *= (1 + annualStepUp / 100);
    }
    
    return yearlyData;
  };
  
  // Helper function to calculate approximate XIRR
  const calculateXIRR = (finalValue, totalInvested, years) => {
    // This is a simplified XIRR calculation
    const r = Math.pow(finalValue / totalInvested, 1 / years) - 1;
    return Math.round(r * 100 * 100) / 100; // Return percentage with 2 decimal places
  };

  const results = useMemo(() => calculateSIPReturns(formData), [formData]);

  const handleInputChange = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const finalValues = results[results.length - 1];
  const pieData = [
    { name: 'Total Invested', value: finalValues?.totalInvested ?? 0, color: '#0088FE' },
    { name: 'Estimated Returns', value: finalValues?.estimatedReturn ?? 0, color: '#00C49F' }
  ];

  const formatCurrency = (number, maximumFractionDigits = 2) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      notation: number >= 100000 ? 'compact' : 'standard',
      maximumFractionDigits 
    }).format(number)
  }

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <Container size="lg" py="md">
      <Stack spacing="md">
        {/* Input Form */}
        <Paper shadow="sm" radius="md" p="md">
          <Title order={2} mb="md">SIP Calculator</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <TextInput
                label="Initial Investment (₹)"
                type="number"
                value={formData.initialInvestment}
                onChange={(e) => handleInputChange(e.target.value, 'initialInvestment')}
                styles={{ input: { width: '100%' } }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <TextInput
                label="Monthly SIP (₹)"
                type="number"
                value={formData.monthlySIP}
                onChange={(e) => handleInputChange(e.target.value, 'monthlySIP')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <TextInput
                label="Annual Step-up (%)"
                type="number"
                value={formData.annualStepUp}
                onChange={(e) => handleInputChange(e.target.value, 'annualStepUp')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <TextInput
                label="Investment Period (Years)"
                type="number"
                value={formData.totalYears}
                onChange={(e) => handleInputChange(e.target.value, 'totalYears')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
              <TextInput
                label="Expected Return Rate (%)"
                type="number"
                value={formData.expectedReturn}
                onChange={(e) => handleInputChange(e.target.value, 'expectedReturn')}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Charts Section */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <Paper shadow="sm" radius="md" p="md">
              <Title order={2} mb="md">Investment Summary</Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="top" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 6, lg: 8 }}>
            <Paper shadow="sm" radius="md" p="md">
              <Title order={2} mb="md">Growth Trajectory</Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${formatCurrency(value, 0)}`} />
                    <Tooltip formatter={(value) => `${formatCurrency(value)}`} />
                    <Legend />
                    <Line strokeWidth={1.5} dataKey="totalValue" stroke="#8884d8" name="Total Value" />
                    <Line strokeWidth={1.5} dataKey="totalInvested" stroke="#82ca9d" name="Total Invested" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Table Section */}
        <Paper shadow="sm" radius="md" p="md">
          <Title order={2} mb="md">Year-wise Breakdown</Title>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Year</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Total Invested</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Estimated Returns</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Total Value</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {results?.map((row) => (
                <Table.Tr key={row.year}>
                  <Table.Td>{row.year}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(row.totalInvested)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(row.estimatedReturn)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(row.totalValue)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>
    </Container>
  );
};

export default SIPCalculator;