import React, { useState } from 'react';


const formatReponse = (text) => {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href='$2' target='_blank' rel='noopener noreferrer'>$1</a>`)
    .replace(/\n/g, "<br>");
};


const ChatbotComponent = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [historique, setHistorique] = useState([]);

  

  const envoyerQuestion = async () => {
    if (!question.trim()) return;

    const res = await fetch('http://localhost:3005/api/chatbot/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    const nouvelleEntree = { question, reponse: data.answer };
    setHistorique((prev) => [...prev, nouvelleEntree]);
    setResponse(data.answer);
    setQuestion('');
  };

  return (
    <div style={styles.container}>
      <h2>🤖 Assistant TaxaCall</h2>

      <div style={styles.chatBox}>
        {historique.map((entry, index) => (
          <div key={index} style={styles.entry}>
            <p><strong>🧑‍💼 Vous :</strong> {entry.question}</p>
            <p>
  <strong>🤖 Bot :</strong>{' '}
  <span dangerouslySetInnerHTML={{ __html: formatReponse(entry.reponse) }} />
</p>

          </div>
        ))}
      </div>

      <div style={styles.form}>
        <input
          type="text"
          placeholder="Posez votre question ici..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={styles.input}
        />
        <button onClick={envoyerQuestion} style={styles.button}>Envoyer</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '700px',
    margin: 'auto',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  },
  chatBox: {
    height: '300px',
    overflowY: 'auto',
    backgroundColor: '#fff',
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
  entry: {
    marginBottom: '15px',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '10px'
  },
  form: {
    display: 'flex',
    gap: '10px'
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px'
  },
  button: {
    backgroundColor: '#0073A8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default ChatbotComponent;
