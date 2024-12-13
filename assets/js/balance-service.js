var API_BASE_URL = window.API_BASE_URL;

async function getCurrentBalance() {
  try {
    const response = await fetch(`${API_BASE_URL}/balance/current`);
    if (!response.ok) throw new Error("Failed to fetch current balance");
    return await response.json();
  } catch (error) {
    console.error("Error fetching current balance:", error);
    throw error;
  }
}

async function getBalanceHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/balance/`);
    if (!response.ok) throw new Error("Failed to fetch balance history");
    return await response.json();
  } catch (error) {
    console.error("Error fetching balance history:", error);
    throw error;
  }
}

async function recalculateBalance() {
  try {
    const response = await fetch(`${API_BASE_URL}/balance/recalculate`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to recalculate balance");
    return true;
  } catch (error) {
    console.error("Error recalculating balance:", error);
    throw error;
  }
}

window.balanceService = {
  getCurrentBalance,
  getBalanceHistory,
  recalculateBalance,
};
