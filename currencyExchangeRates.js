export const getUSDToPKRExchangeRates = async () => {
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        return data.rates.PKR;
    } catch (error) {
        console.error("Error fetching USD to PKR exchange rate:", error);
        return null;
    }
}