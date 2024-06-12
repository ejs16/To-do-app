
async function classifyDocument(text) {
  const apiKey = 'sk-proj-eE6nZcpYoccqeYHW5uWZT3BlbkFJM2mPaok0Cm0zgj6f8Cpe';
  const endpoint = 'https://api.openai.com/v1/completions';
  
  const prompt = 
  `Classify the following document text into one of the following categories based on its content: 
 
  Support Letter, 
  Resume,
  Passport, 
  Visa, 
  G-28, 
  W-2, 
  Paystub, 
  I-94, 
  Membership
 
  You should not make up any new categories, 
  it must fit into one of the specified previously mentioned. If you do not know, it should be 'Other'.\n\nDocument text: "${text}"\n\nCategory: `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt,
        max_tokens: 10
      })
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const data = await response.json();
    const classification = data.choices[0].text.trim();
    return classification;
  } catch (error) {
    console.error('Error classifying document:', error);
    return 'Unknown';
  }  
}

export default classifyDocument;