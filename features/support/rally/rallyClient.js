/**
 * Rally API Client for Intelligent_Automation framework
 * Handles communication with Rally for story retrieval and defect creation
 */
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class RallyClient {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.RALLY_API_KEY;
    this.workspace = config.workspace || process.env.RALLY_WORKSPACE;
    this.project = config.project || process.env.RALLY_PROJECT;
    this.baseUrl = config.baseUrl || 'https://rally1.rallydev.com/slm/webservice/v2.0/';
    
    if (!this.apiKey) {
      console.warn('Rally API Key not found. Please set RALLY_API_KEY in your environment or provide it in the constructor.');
    }
    
    this.headers = {
      'zsessionid': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get user stories from Rally
   * @param {string} query - Query to filter user stories (default: ScheduleState = "Defined")
   * @returns {Promise<Array>} - Array of user stories
   */
  async getUserStories(query = '') {
    try {
      console.log('Fetching user stories from Rally...');
      const url = `${this.baseUrl}hierarchicalrequirement`;
      const params = {
        workspace: this.workspace,
        project: this.project,
        query: query || '(ScheduleState = "Defined")',
        fetch: 'Name,Description,AcceptanceCriteria,FormattedID,Notes,Owner,Priority,PlanEstimate,Tags'
      };
      
      const response = await axios.get(url, { 
        headers: this.headers, 
        params 
      });
      
      console.log(`Retrieved ${response.data.QueryResult.TotalResultCount} user stories from Rally`);
      return response.data.QueryResult.Results;
    } catch (error) {
      console.error('Error fetching user stories from Rally:', error.message);
      throw error;
    }
  }
  
  /**
   * Get a specific user story from Rally
   * @param {string} formattedID - The formatted ID of the story (e.g., US123)
   * @returns {Promise<Object>} - User story object
   */
  async getUserStory(formattedID) {
    try {
      const url = `${this.baseUrl}hierarchicalrequirement`;
      const params = {
        workspace: this.workspace,
        project: this.project,
        query: `(FormattedID = "${formattedID}")`,
        fetch: 'Name,Description,AcceptanceCriteria,FormattedID,Notes,Owner,Priority,PlanEstimate,Tags'
      };
      
      const response = await axios.get(url, { 
        headers: this.headers, 
        params 
      });
      
      if (response.data.QueryResult.TotalResultCount === 0) {
        throw new Error(`User story ${formattedID} not found`);
      }
      
      return response.data.QueryResult.Results[0];
    } catch (error) {
      console.error(`Error fetching user story ${formattedID}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Create a defect in Rally
   * @param {Object} defectData - Defect information
   * @param {string} defectData.name - Defect name/title
   * @param {string} defectData.description - Defect description
   * @param {string} defectData.severity - Defect severity
   * @param {string} defectData.priority - Defect priority
   * @param {string} defectData.environment - Environment where the defect was found
   * @param {string} defectData.storyID - Associated user story ID
   * @param {string} defectData.reproducibleSteps - Steps to reproduce the defect
   * @param {string} defectData.screenshotPath - Path to screenshot file (optional)
   * @returns {Promise<Object>} - Created defect object
   */
  async createDefect(defectData) {
    try {
      console.log(`Creating defect in Rally: ${defectData.name}`);
      const url = `${this.baseUrl}defect/create`;
      
      // Build defect payload
      const defectPayload = {
        Defect: {
          Name: defectData.name,
          Description: defectData.description,
          Severity: defectData.severity || 'Medium',
          Priority: defectData.priority || 'Medium',
          Environment: defectData.environment || 'Test',
          Project: this.project,
          Workspace: this.workspace,
          Notes: defectData.reproducibleSteps || ''
        }
      };
      
      // If story ID is provided, link the defect to the story
      if (defectData.storyID) {
        try {
          const story = await this.getUserStory(defectData.storyID);
          defectPayload.Defect.Requirement = story._ref;
        } catch (storyError) {
          console.warn(`Could not link to story ${defectData.storyID}:`, storyError.message);
        }
      }
      
      // Create the defect
      const response = await axios.post(url, defectPayload, { 
        headers: this.headers
      });
      
      if (response.data.CreateResult.Errors && response.data.CreateResult.Errors.length > 0) {
        throw new Error(`Rally API error: ${JSON.stringify(response.data.CreateResult.Errors)}`);
      }
      
      const createdDefect = response.data.CreateResult.Object;
      console.log(`Defect created successfully: ${createdDefect.FormattedID}`);
      
      // If screenshot is provided, attach it to the defect
      if (defectData.screenshotPath && fs.existsSync(defectData.screenshotPath)) {
        await this.attachFileToDefect(createdDefect._ref, defectData.screenshotPath);
      }
      
      return createdDefect;
    } catch (error) {
      console.error('Error creating defect in Rally:', error.message);
      throw error;
    }
  }
  
  /**
   * Attach a file to a defect in Rally
   * @param {string} defectRef - Reference to the defect
   * @param {string} filePath - Path to the file to attach
   * @returns {Promise<Object>} - Created attachment object
   */
  async attachFileToDefect(defectRef, filePath) {
    try {
      console.log(`Attaching file to defect: ${path.basename(filePath)}`);
      const url = `${this.baseUrl}attachment/create`;
      
      // Read file as base64
      const fileContent = await fs.readFile(filePath);
      const base64Content = fileContent.toString('base64');
      
      // Build attachment payload
      const attachmentPayload = {
        Attachment: {
          Artifact: defectRef,
          Content: base64Content,
          ContentType: this._getContentType(filePath),
          Name: path.basename(filePath),
          Size: fileContent.length,
          Project: this.project,
          Workspace: this.workspace
        }
      };
      
      // Create the attachment
      const response = await axios.post(url, attachmentPayload, { 
        headers: this.headers
      });
      
      if (response.data.CreateResult.Errors && response.data.CreateResult.Errors.length > 0) {
        throw new Error(`Rally API error: ${JSON.stringify(response.data.CreateResult.Errors)}`);
      }
      
      console.log(`File attached successfully: ${path.basename(filePath)}`);
      return response.data.CreateResult.Object;
    } catch (error) {
      console.error('Error attaching file to defect:', error.message);
      throw error;
    }
  }
  
  /**
   * Get content type based on file extension
   * @param {string} filePath - Path to the file
   * @returns {string} - Content type
   */
  _getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }
}

module.exports = RallyClient;
