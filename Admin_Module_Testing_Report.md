# Skillora Admin Dashboard Testing Report

## Tested By

Member 5 – Admin Features & Testing

## Testing Date

11 June 2026

---

# 1. Notification System

## Issue 1.1 – Notification Bell Icon Not Working

**Page:** Admin Dashboard

**Description:**
The notification bell icon located in the top-right corner of the admin dashboard does not respond when clicked.

**Expected Result:**
A notification panel or notification page should open and display available notifications.

**Actual Result:**
No action occurs when the notification icon is clicked.

**Status:** Open

---

# 2. User Management Module

## Issue 2.1 – Recruiter Action Icons Not Working

**Page:** User Management → Recruiters

**Description:**
The action icons displayed for recruiter records are not functioning properly.

**Affected Icons:**

* View (Eye Icon)
* Warning/Alert Icon

**Expected Result:**

* Eye icon should display recruiter details.
* Warning icon should perform the intended action or open a related page.

**Actual Result:**
No response occurs when these icons are clicked.

**Status:** Open

---

## Issue 2.2 – Candidate Action Icons Not Working

**Page:** User Management → Candidates

**Description:**
The action icons available for candidate records are not functioning.

**Affected Icons:**

* View (Eye Icon)
* Warning/Alert Icon

**Expected Result:**
Relevant candidate details or actions should be displayed.

**Actual Result:**
No response occurs when these icons are clicked.

**Status:** Open

---

## Issue 2.3 – Unknown Action Icon

**Page:** User Management → Candidates

**Description:**
The last action icon (red prohibited symbol) is displayed but its functionality is unclear.

**Expected Result:**
The purpose of the icon should be clearly defined and functional.

**Actual Result:**
No clear action or functionality is available.

**Status:** Needs Clarification

---

# 3. Recruiter Verification Module

## Issue 3.1 – Verification Status Not Updating

**Page:** Recruiter Verification / User Management

**Description:**
Approve and Reject buttons are working in the Recruiter Verification page.

However, after approval or rejection, the updated status is not reflected in the User Management page.

**Expected Result:**
Status changes should automatically update across related modules.

**Actual Result:**
User Management continues displaying outdated information.

**Status:** Open

---

# 4. Interview Management Module

## Issue 4.1 – Meeting Join Function Not Working Properly

**Page:** Interview Management

**Description:**
Clicking the Join button opens the meeting page.

**Expected Result:**
The meeting should load successfully and allow participation.

**Actual Result:**
The meeting page remains stuck on loading and never joins the meeting.

**Status:** Open

---

# 5. Opportunities Module

## Issue 5.1 – Opportunity Data Not Persisting

**Page:** Opportunities

**Description:**
New opportunities can be added successfully and the Cancel button functions correctly.

However, newly added opportunities disappear after refreshing the browser or reopening the application.

**Expected Result:**
Added opportunities should be stored permanently and remain available after reload.

**Actual Result:**
Data is lost after page refresh or application restart.

**Status:** Open

---

# 6. Feedback & Support Module

## Issue 6.1 – Mark Resolved Button Not Working

**Page:** Feedback & Support

**Description:**
The Mark Resolved button does not perform any action when clicked.

**Expected Result:**
The complaint/feedback status should update to Resolved.

**Actual Result:**
No change occurs.

**Status:** Open

---

# 7. System Settings Module

## Issue 7.1 – Save Changes Button Not Working

**Page:** System Settings

**Description:**
The Save Changes button is not functioning.

**Expected Result:**
Updated settings should be saved successfully.

**Actual Result:**
No action occurs.

**Status:** Open

---

## Issue 7.2 – Configuration Toggle Switches Not Working

**Page:** System Settings

**Description:**
The platform configuration toggle switches are not functioning correctly.

**Affected Settings:**

* Auto Approve Recruiters
* Email Notifications
* Maintenance Mode

**Expected Result:**
Settings should update and persist after toggling.

**Actual Result:**
Changes are not saved or reflected properly.

**Status:** Open

---

# Testing Summary

## Successfully Working Features

* Recruiter Verification Approve Button
* Recruiter Verification Reject Button
* Opportunity Creation Form Opens
* Opportunity Cancel Button Works
* Interview Join Button Opens Meeting Page

## Features Requiring Fixes

* Notification System
* Recruiter Action Icons
* Candidate Action Icons
* Recruiter Status Synchronization
* Interview Meeting Loading
* Opportunity Data Persistence
* Feedback Resolution
* System Settings Save Functionality
* Configuration Toggles

## Overall Status

Admin Dashboard UI is accessible and navigation works. Multiple functionality-related issues were identified that require backend integration, data persistence, and feature completion.
