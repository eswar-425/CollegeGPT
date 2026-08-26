import * as documentService from '../services/documentService.js';

export async function uploadDocument(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const document = await documentService.uploadAndProcessDocument(req.file, req.body, userId);
    res.status(201).json({
      success: true,
      message: 'Document uploaded and processing queued.',
      document,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocuments(req, res, next) {
  try {
    const { search, category, department, status, page, limit } = req.query;
    const result = await documentService.listDocuments({
      search,
      category,
      department,
      status,
      page,
      limit,
    });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocument(req, res, next) {
  try {
    const result = await documentService.getDocumentById(req.params.id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function reprocessDocument(req, res, next) {
  try {
    const result = await documentService.reprocessDocument(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const result = await documentService.deleteDocument(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getDocumentStatus(req, res, next) {
  try {
    const result = await documentService.getDocumentStatus(req.params.id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
