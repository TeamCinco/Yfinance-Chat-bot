from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/financial_statement")
async def get_financial_statement(ticker: str, statement: str, frequency: str):
    stock = yf.Ticker(ticker)
    
    if frequency not in ["annual", "quarterly"]:
        raise HTTPException(status_code=400, detail="Invalid frequency")

    if statement == 'balanceSheet':
        data = stock.balance_sheet if frequency == "annual" else stock.quarterly_balance_sheet
    elif statement == 'incomeStatement':
        data = stock.financials if frequency == "annual" else stock.quarterly_financials
    elif statement == 'cashflowStatement':
        data = stock.cashflow if frequency == "annual" else stock.quarterly_cashflow
    else:
        raise HTTPException(status_code=400, detail="Invalid statement type")

    return data.to_json()

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
