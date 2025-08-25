/**
 * JIRA API Client for Intelligent_Automation framework
 * Handles communication with JIRA for story retrieval and defect creation
 */
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class JiraClient {
  constructor(config = {}) {
    this.username = config.username || process.env.JIRA_USERNAME;
    this.apiToken = config.apiToken || process.env.JIRA_API_TOKEN;
    this.baseUrl = config.baseUrl || process.env.JIRA_BASE_URL;
    this.projectKey = config.projectKey || process.env.JIRA_PROJECT_KEY;
    
    if (!this.username || !this.apiToken || !this.baseUrl) {
      console.warn('JIRA credentials not found. Please set JIRA_USERNAME, JIRA_API_TOKEN, and JIRA_BASE_URL in your environment or provide them in the constructor.');
    }
    
    // Create base64 encoded auth string
    const auth = Buffer.from(`${this.username}:${this.apiToken}`).toString('base64');
    
    this.headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Get user stories from JIRA
   * @param {string} jql - JQL query to filter user stories
   * @returns {Promise<Array>} - Array of user stories
   */
  async getUserStories(jql = '') {
    try {
      console.log('Fetching user stories from JIRA...');
      const url = `${this.baseUrl}/rest/api/3/search`;
      
      // Default JQL to get user stories
      const defaultJql = `project = "${this.projectKey}" AND issuetype = "Story" AND status != "Done"`;
      const query = jql || defaultJql;
      
      const payload = {
        jql: query,
        maxResults: 100,
        fields: [
          'summary',
          'description',
          'status',
          'priority',
          'assignee',
          'reporter',
          'created',
          'updated',
          'labels',
          'components',
          'customfield_*' // Include custom fields for acceptance criteria
        ]
      };
      
      const response = await axios.post(url, payload, { headers: this.headers });
      
      console.log(`Retrieved ${response.data.total} user stories from JIRA`);
      return response.data.issues;
    } catch (error) {
      console.error('Error fetching user stories from JIRA:', error.message);
      if (error.response) {
        console.error('JIRA API Error:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Get a specific user story from JIRA
   * @param {string} issueKey - The issue key (e.g., PROJ-123)
   * @returns {Promise<Object>} - User story object
   */
  async getUserStory(issueKey) {
    try {
      const url = `${this.baseUrl}/rest/api/3/issue/${issueKey}`;
      
      const response = await axios.get(url, { 
        headers: this.headers,
        params: {
          fields: 'summary,description,status,priority,assignee,reporter,created,updated,labels,components,customfield_*'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching user story ${issueKey}:`, error.message);
      if (error.response) {
        console.error('JIRA API Error:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Create a bug/defect in JIRA
   * @param {Object} defectData - Defect information
   * @param {string} defectData.summary - Defect summary/title
   * @param {string} defectData.description - Defect description
   * @param {string} defectData.priority - Defect priority (Highest, High, Medium, Low, Lowest)
   * @param {string} defectData.environment - Environment where the defect was found
   * @param {string} defectData.storyKey - Associated user story key
   * @param {string} defectData.reproducibleSteps - Steps to reproduce the defect
   * @param {string} defectData.screenshotPath - Path to screenshot file (optional)
   * @returns {Promise<Object>} - Created defect object
   */
  async createDefect(defectData) {
    try {
      console.log(`Creating defect in JIRA: ${defectData.summary}`);
      const url = `${this.baseUrl}/rest/api/3/issue`;
      
      // Build defect payload
      const defectPayload = {
        fields: {
          project: {
            key: this.projectKey
          },
          summary: defectData.summary,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: defectData.description
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: "Bug"
          },
          priority: {
            name: defectData.priority || "Medium"
          }
        }
      };
      
      // Add environment if provided
      if (defectData.environment) {
        defectPayload.fields.environment = {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: defectData.environment
                }
              ]
            }
          ]
        };
      }
      
      // Add labels
      defectPayload.fields.labels = ["automated-test-failure"];
      
      // Create the defect
      const response = await axios.post(url, defectPayload, { 
        headers: this.headers
      });
      
      const createdDefect = response.data;
      console.log(`Defect created successfully: ${createdDefect.key}`);
      
      // Link to user story if provided
      if (defectData.storyKey) {
        await this.linkIssues(createdDefect.key, defectData.storyKey, "relates to");
      }
      
      // Add comment with reproducible steps
      if (defectData.reproducibleSteps) {
        await this.addComment(createdDefect.key, defectData.reproducibleSteps);
      }
      
      // Attach screenshot if provided
      if (defectData.screenshotPath && fs.existsSync(defectData.screenshotPath)) {
        await this.attachFileToIssue(createdDefect.key, defectData.screenshotPath);
      }
      
      return createdDefect;
    } catch (error) {
      console.error('Error creating defect in JIRA:', error.message);
      if (error.response) {
        console.error('JIRA API Error:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Link two JIRA issues
   * @param {string} inwardIssue - The issue key that will have the link (defect)
   * @param {string} outwardIssue - The issue key being linked to (story)
   * @param {string} linkType - Type of link (e.g., "relates to", "blocks", "is caused by")
   * @returns {Promise<Object>} - Link result
   */
  async linkIssues(inwardIssue, outwardIssue, linkType = "relates to") {
    try {
      console.log(`Linking ${inwardIssue} to ${outwardIssue} with link type: ${linkType}`);
      const url = `${this.baseUrl}/rest/api/3/issueLink`;
      
      const linkPayload = {
        type: {
          name: linkType
        },
        inwardIssue: {
          key: inwardIssue
        },
        outwardIssue: {
          key: outwardIssue
        }
      };
      
      const response = await axios.post(url, linkPayload, { 
        headers: this.headers
      });
      
      console.log(`Issues linked successfully`);
      return response.data;
    } catch (error) {
      console.error(`Error linking issues:`, error.message);
      if (error.response) {
        console.error('JIRA API Error:', error.response.data);
      }
      // Don't throw error for linking failures, just log them
    }
  }
  
  /**
   * Add a comment to a JIRA issue
   * @param {string} issueKey - The issue key
   * @param {string} comment - Comment text
   * @returns {Promise<Object>} - Comment result
   */
  async addComment(issueKey, comment) {
    try {
      console.log(`Adding comment to ${issueKey}`);
      const url = `${this.baseUrl}/rest/api/3/issue/${issueKey}/comment`;
      
      const commentPayload = {
        body: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: comment
                }
              ]
            }
          ]
        }
      };
      
      const response = await axios.post(url, commentPayload, { 
        headers: this.headers
      });
      
      console.log(`Comment added successfully`);
      return response.data;
    } catch (error) {
      console.error(`Error adding comment:`, error.message);
      if (error.response) {
        console.error('JIRA API Error:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Attach a file to a JIRA issue
   * @param {string} issueKey - The issue key
   * @param {string} filePath - Path to the file to attach
   * @returns {Promise<Object>} - Attachment result
   */
  async attachFileToIssue(issueKey, filePath) {
    try {
      console.log(`Attaching file to ${issueKey}: ${path.basename(filePath)}`);
      const url = `${this.baseUrl}/rest/api/3/issue/${issueKey}/attachments`;
      
      // Create form data
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      
      // Update headers for multipart form
      const formHeaders = {
        ...this.headers,
        ...form.getHeaders(),
        'X-Atlassian-Token': 'no-check' // Required for file uploads
      };
      delete formHeaders['Content-Type']; // Let form-data set the content type
      
      const response = await axios.post(url, form, { 
        headers: formHeaders
      });
      
      console.log(`File attached successfully: ${path.basename(filePath)}`);
      return response.data;
    } catch (error) {
      console.error('Error attaching file to issue:', error.message);
      if (error.response) {
        console.error('JIRA API Error:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Get acceptance criteria from a JIRA issue
   * @param {Object} issue - JIRA issue object
   * @returns {string} - Acceptance criteria text
   */
  getAcceptanceCriteria(issue) {
    // Check common custom field names for acceptance criteria
    const customFields = issue.fields;
    const acceptanceCriteriaFields = [
      'customfield_10000', // Common field ID
      'customfield_10001',
      'customfield_10002',
      'customfield_10003',
      'customfield_10004',
      'customfield_10005'
    ];
    
    // Look for acceptance criteria in custom fields
    for (const fieldId of acceptanceCriteriaFields) {
      if (customFields[fieldId]) {
        if (typeof customFields[fieldId] === 'string') {
          return customFields[fieldId];
        } else if (customFields[fieldId].content) {
          // Handle Atlassian Document Format
          return this._extractTextFromADF(customFields[fieldId]);
        }
      }
    }
    
    // Fallback to description if no acceptance criteria field found
    if (customFields.description) {
      if (typeof customFields.description === 'string') {
        return customFields.description;
      } else if (customFields.description.content) {
        return this._extractTextFromADF(customFields.description);
      }
    }
    
    return '';
  }
  
  /**
   * Extract plain text from Atlassian Document Format (ADF)
   * @param {Object} adf - ADF object
   * @returns {string} - Plain text
   */
  _extractTextFromADF(adf) {
    if (!adf || !adf.content) return '';
    
    let text = '';
    
    function extractText(content) {
      if (Array.isArray(content)) {
        content.forEach(item => extractText(item));
      } else if (content.type === 'text') {
        text += content.text || '';
      } else if (content.content) {
        extractText(content.content);
      }
      
      // Add line breaks for paragraphs
      if (content.type === 'paragraph') {
        text += '\n';
      }
    }
    
    extractText(adf.content);
    return text.trim();
  }
}

module.exports = JiraClient;
