function initializeBalanceChart() {
  const options = {
    chart: {
      type: "line",
      height: 350,
    },
    series: [
      {
        name: "Balance",
        data: [],
      },
    ],
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return `R$ ${value.toFixed(2)}`;
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return `R$ ${value.toFixed(2)}`;
        },
      },
    },
  };

  const chart = new ApexCharts(
    document.querySelector("#balanceChart"),
    options
  );
  chart.render();
  return chart;
}

async function updateBalanceChart(chart) {
  try {
    const balanceHistory = await window.balanceService.getBalanceHistory();
    const seriesData = balanceHistory.balances.map((item) => ({
      x: new Date(item.date).getTime(),
      y: item.balance,
    }));

    chart.updateSeries([
      {
        data: seriesData,
      },
    ]);
  } catch (error) {
    console.error("Error updating balance chart:", error);
  }
}

window.balanceChart = {
  initialize: initializeBalanceChart,
  update: updateBalanceChart,
};
