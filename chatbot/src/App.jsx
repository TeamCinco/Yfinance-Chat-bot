import React, { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import UserInput from './components/UserInput.jsx';
import fetchFinancialStatement from './components/fetchFinanceData';
import { useTable } from 'react-table';
import './customStyles.css';

const API_KEY = "your-openai-api-key-here";

function App() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [datesMap, setDatesMap] = useState({});

  const handleUserInputSubmit = async (ticker, statementType, frequency) => {
    const financialStatementData = await fetchFinancialStatement(ticker, statementType, frequency);
    console.log('Financial Statement Data:', financialStatementData);
    setFinancialData(financialStatementData);

    if (financialStatementData) {
      const parsedData = JSON.parse(financialStatementData);
      const dates = Object.keys(parsedData).map(date => {
        const dateObject = new Date(Number(date));
        const formattedDate = dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        return { original: date, formatted: formattedDate };
      });

      const datesMap = dates.reduce((acc, { original, formatted }) => {
        acc[original] = formatted;
        return acc;
      }, {});
      setDatesMap(datesMap);

      const metrics = Object.keys(parsedData[Object.keys(parsedData)[0]]);

      const tableColumns = [
        { Header: 'Metric', accessor: 'metric' },
        ...dates.map(({ formatted }, index) => ({ Header: formatted, accessor: `date_${index}` }))
      ];

      const tableData = metrics.map(metric => {
        const row = { metric };
        dates.forEach(({ original }, index) => {
          row[`date_${index}`] = parsedData[original][metric];
        });
        return row;
      });

      setColumns(tableColumns);
      setData(tableData);
    }
  };

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "User",
      direction: "outgoing"
    };
    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setTyping(true);

    await processMessageToChatGPT(newMessages, message);
  };

  const processMessageToChatGPT = async (chatMessages, userMessage) => {
    const formattedFinancialData = financialData
      ? `\n\nFinancial Statement Data (with Years):\n${JSON.stringify(
        Object.keys(JSON.parse(financialData)).reduce((acc, key) => {
          acc[datesMap[key]] = JSON.parse(financialData)[key];
          return acc;
        }, {})
      )}`
      : '';

    const combinedMessage = userMessage + formattedFinancialData;

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // Add the combined message with financial data context
    apiMessages.push({ role: "user", content: combinedMessage });

    const systemMessage = {
      role: "system",
      content: "You are a 30 year veteran-financial analyst / portfolio manager in may 2024 and are now providing easy to understand defintions of financial terms when asked. You also review the financial data given and WHHEN ASKED you provide insight on the trends of the data. DONT ANSWER ANYTHING ELSE IF you are asked something that is not from the data given."
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        ...apiMessages
      ]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((response) => response.json())
      .then((data) => {
        const responseMessage = {
          message: data.choices[0].message.content,
          sender: "ChatGPT",
          direction: "incoming"
        };
        setMessages([...chatMessages, responseMessage]);
        setTyping(false);
      });
  };

  const Table = ({ columns, data }) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

    return (
      <table {...getTableProps()} className="financial-table">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="App">
      {!financialData ? (
        <UserInput onSubmit={handleUserInputSubmit} />
      ) : (
        <div className="content-container">
          <div className="table-container">
            {columns.length > 0 && data.length > 0 && (
              <Table columns={columns} data={data} />
            )}
          </div>
          <div className="chat-container">
            <MainContainer>
              <ChatContainer>
                <MessageList
                  typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing..." /> : null}
                >
                  {messages.map((message, i) => (
                    <Message key={i} model={message} />
                  ))}
                </MessageList>
                <MessageInput placeholder="Type Message Here" onSend={handleSend} />
              </ChatContainer>
            </MainContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
