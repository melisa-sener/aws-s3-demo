# AWS S3 Demo

## Project Purpose

This demo shows how Amazon S3 storage classes  
(Standard, Standard-IA, Glacier) affect runtime system behavior.

The same UI and backend are used for all requests.  
Only the storage class changes, resulting in different outcomes.

It also demonstrates secure access to private S3 objects using presigned URLs.

The project focuses on:
- A single demo page (`/demo`)
- A single API endpoint that returns a presigned download URL

All unnecessary template and configuration files were intentionally removed to keep the repository simple and demo-oriented.

## Demo
- Page: `/demo`
- API: `/api/get-presigned`