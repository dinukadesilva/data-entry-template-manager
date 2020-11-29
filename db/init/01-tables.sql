CREATE DATABASE data_entry_template_manage;
USE data_entry_template_manage;

CREATE TABLE template
(
    templateId   INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    templateName VARCHAR(30) NOT NULL
);

CREATE TABLE templateInstance
(
    templateInstanceId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    templateId         INT(6) UNSIGNED NOT NULL,
    FOREIGN KEY (templateId) REFERENCES template (templateId)
);

CREATE TABLE templateDataModel
(
    templateDataModelId INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    templateId          INT(6) UNSIGNED NOT NULL,
    dataModelName       VARCHAR(100)    NOT NULL,
    UNIQUE (templateId, dataModelName),
    FOREIGN KEY (templateId) REFERENCES template (templateId)
);