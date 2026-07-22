const { env } = require('../config/env')

// @desc    Get AI hint for coding problem
// @route   POST /api/hint
// @access  Private
const getHint = async (req, res) => {
  try {
    const { code, error, problemDescription } = req.body

    if (!env.openaiApiKey) {
      return res.status(500).json({ message: 'AI service is not configured' })
    }

    const systemPrompt = `You are a friendly and encouraging coding mentor for students aged 11-14 in Bangladesh. 
    Your goal is to provide a short, helpful hint to help them solve a coding problem. 
    Do NOT give them the direct solution. 
    Use simple language. 
    Keep the hint under 3 sentences.`

    const userPrompt = `Problem Description: ${problemDescription}
    My Code:
    ${code}
    
    Error Message: ${error || 'None'}
    
    Can you give me a hint on what might be wrong or what I should do next?`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective and good for hints
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API Error:', errorData)
      return res.status(response.status).json({ 
        message: 'AI service error', 
        details: errorData 
      })
    }

    const data = await response.json()
    const hint = data.choices[0].message.content.trim()

    res.status(200).json({ hint })
  } catch (error) {
    console.error('AI Controller Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports = { getHint }
