// src/services/email.service.ts
import nodemailer from "nodemailer";
import { env } from "@/config/env";
import logger from "@/utils/logger";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info("📧 Email service connected successfully");
    } catch (error) {
      logger.error("❌ Email service connection failed:", error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error("❌ Failed to send email:", error);
      return false;
    }
  }

  // OTP Email Template
  async sendOTPEmail(email: string, firstName: string, otp: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Account</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .otp-code { 
              background-color: #f8f9fa; 
              border: 2px solid #007bff; 
              padding: 15px; 
              text-align: center; 
              font-size: 24px; 
              font-weight: bold; 
              margin: 20px 0; 
              letter-spacing: 3px;
            }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TaskManager - Verify Your Account</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Thank you for registering with TaskManager. Please use the following OTP code to verify your account:</p>
              
              <div class="otp-code">${otp}</div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This OTP will expire in ${Math.floor(env.OTP_EXPIRES_IN / 60)} minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
              
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 TaskManager. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Verify Your TaskManager Account",
      html,
      text: `Hello ${firstName}! Your OTP code is: ${otp}. This code will expire in ${Math.floor(
        env.OTP_EXPIRES_IN / 60
      )} minutes.`,
    });
  }

  // Project Invitation Email Template
  async sendProjectInvitationEmail(
    email: string,
    inviterName: string,
    projectName: string,
    role: string,
    invitationLink: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Project Invitation</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .invitation-details { 
              background-color: #f8f9fa; 
              border-left: 4px solid #28a745; 
              padding: 15px; 
              margin: 20px 0; 
            }
            .cta-button {
              display: inline-block;
              background-color: #28a745;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited to Join a Project!</h1>
            </div>
            <div class="content">
              <h2>Project Invitation</h2>
              <p>You have been invited by <strong>${inviterName}</strong> to join a project on TaskManager.</p>
              
              <div class="invitation-details">
                <h3>📋 Project Details:</h3>
                <p><strong>Project:</strong> ${projectName}</p>
                <p><strong>Role:</strong> ${role}</p>
                <p><strong>Invited by:</strong> ${inviterName}</p>
              </div>
              
              <p>Click the button below to accept the invitation and join the project:</p>
              
              <a href="${invitationLink}" class="cta-button">Accept Invitation</a>
              
              <p><small>If the button doesn't work, copy and paste this link into your browser:<br>
              ${invitationLink}</small></p>
              
              <p>If you don't want to join this project, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 TaskManager. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Invitation to join "${projectName}" project`,
      html,
      text: `You have been invited by ${inviterName} to join the "${projectName}" project as ${role}. Accept invitation: ${invitationLink}`,
    });
  }

  // Issue Assignment Email Template
  async sendIssueAssignmentEmail(
    email: string,
    assigneeName: string,
    issueKey: string,
    issueTitle: string,
    projectName: string,
    assignedBy: string,
    issueLink: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Issue Assignment</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #fd7e14; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .issue-details { 
              background-color: #fff3cd; 
              border-left: 4px solid #fd7e14; 
              padding: 15px; 
              margin: 20px 0; 
            }
            .cta-button {
              display: inline-block;
              background-color: #fd7e14;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Issue Assignment</h1>
            </div>
            <div class="content">
              <h2>Hello ${assigneeName}!</h2>
              <p>You have been assigned a new issue by <strong>${assignedBy}</strong>.</p>
              
              <div class="issue-details">
                <h3>🎯 Issue Details:</h3>
                <p><strong>Issue:</strong> ${issueKey}</p>
                <p><strong>Title:</strong> ${issueTitle}</p>
                <p><strong>Project:</strong> ${projectName}</p>
                <p><strong>Assigned by:</strong> ${assignedBy}</p>
              </div>
              
              <p>Click the button below to view the issue details:</p>
              
              <a href="${issueLink}" class="cta-button">View Issue</a>
              
              <p><small>If the button doesn't work, copy and paste this link into your browser:<br>
              ${issueLink}</small></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 TaskManager. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Issue Assigned: ${issueKey} - ${issueTitle}`,
      html,
      text: `You have been assigned issue ${issueKey}: ${issueTitle} in project ${projectName} by ${assignedBy}. View issue: ${issueLink}`,
    });
  }

  // Password Reset Email Template
  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<boolean> {
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .warning { 
              background-color: #f8d7da; 
              border-left: 4px solid #dc3545; 
              padding: 15px; 
              margin: 20px 0; 
            }
            .cta-button {
              display: inline-block;
              background-color: #dc3545;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>We received a request to reset your TaskManager account password.</p>
              
              <div class="warning">
                <p><strong>⚠️ Important Security Notice:</strong></p>
                <ul>
                  <li>This reset link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>Click the button below to reset your password:</p>
              
              <a href="${resetLink}" class="cta-button">Reset Password</a>
              
              <p><small>If the button doesn't work, copy and paste this link into your browser:<br>
              ${resetLink}</small></p>
              
              <p>If you continue to have problems, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 TaskManager. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Reset Your TaskManager Password",
      html,
      text: `Hello ${firstName}! Reset your password using this link: ${resetLink}. This link expires in 1 hour.`,
    });
  }
}

export default new EmailService();
