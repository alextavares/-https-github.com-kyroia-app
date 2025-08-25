const aiService = {
  generateResponse: jest.fn(),
  getModelsForPlan: jest.fn().mockReturnValue([{ id: 'gpt-3.5-turbo' }]),
  getAllAvailableModels: jest.fn().mockReturnValue([{ id: 'gpt-3.5-turbo' }]),
  estimateTokens: jest.fn().mockReturnValue(100),
}

module.exports = { aiService }
