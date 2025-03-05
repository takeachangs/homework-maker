document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const generatePdfBtn = document.getElementById('generate-pdf');
    const fileNameInput = document.getElementById('file-name');
    const loadingIndicator = document.getElementById('loading');

    // Global variables
    let images = [];
    
    function showLoading() {
        loadingIndicator.style.display = 'flex';
        loadingIndicator.classList.remove('hidden');
    }
    
    function hideLoading() {
        loadingIndicator.style.display = 'none';
        loadingIndicator.classList.add('hidden');
    }
    
    // Make sure loading is hidden initially
    hideLoading();
    
    // Disable generate button initially
    generatePdfBtn.disabled = true;

    // Initialize sortable
    new Sortable(previewContainer, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function() {
            // Update the images array based on the new order
            const imageElements = previewContainer.querySelectorAll('.image-preview');
            const newImagesOrder = [];
            
            imageElements.forEach(element => {
                const index = parseInt(element.dataset.index);
                newImagesOrder.push(images[index]);
            });
            
            images = newImagesOrder;
            
            // Update data-index attributes
            updateImageIndexes();
        }
    });

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    // Handle selected files
    fileInput.addEventListener('change', handleFiles);

    // Generate PDF button click
    generatePdfBtn.addEventListener('click', generatePDF);

    // Helper functions
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        handleFiles(files);
    }

    function handleFiles(e) {
        let files;
        if (e.target && e.target.files) {
            files = e.target.files;
        } else {
            files = e;
        }
        
        files = [...files].filter(file => file.type.startsWith('image/'));
        
        files.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const image = new Image();
                image.src = e.target.result;
                
                image.onload = function() {
                    // Add the image to our array
                    images.push({
                        src: e.target.result,
                        width: image.width,
                        height: image.height
                    });
                    
                    // Create preview
                    createImagePreview(e.target.result, images.length - 1);
                    
                    // Enable generate button if we have images
                    if (images.length > 0) {
                        generatePdfBtn.disabled = false;
                    }
                };
            };
            
            reader.readAsDataURL(file);
        });
    }

    function createImagePreview(src, index) {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.dataset.index = index;
        
        const img = document.createElement('img');
        img.src = src;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', function() {
            removeImage(index);
        });
        
        preview.appendChild(img);
        preview.appendChild(removeBtn);
        previewContainer.appendChild(preview);
    }

    function removeImage(index) {
        // Remove the image from the array
        images.splice(index, 1);
        
        // Clear preview container
        previewContainer.innerHTML = '';
        
        // Recreate previews
        images.forEach((image, i) => {
            createImagePreview(image.src, i);
        });
        
        // Disable generate button if no images
        if (images.length === 0) {
            generatePdfBtn.disabled = true;
        }
    }

    function updateImageIndexes() {
        const imageElements = previewContainer.querySelectorAll('.image-preview');
        imageElements.forEach((element, index) => {
            element.dataset.index = index;
            
            // Update remove button event listener
            const removeBtn = element.querySelector('.remove-btn');
            removeBtn.replaceWith(removeBtn.cloneNode(true));
            element.querySelector('.remove-btn').addEventListener('click', function() {
                removeImage(index);
            });
        });
    }

    function generatePDF() {
        if (images.length === 0) {
            alert('Please add at least one image');
            return;
        }
        
        // Show loading indicator
        showLoading();
        
        // Use timeout to allow the UI to update before the potentially heavy PDF generation
        setTimeout(() => {
            // Get current date for the header
            const currentDate = new Date();
            const dateString = currentDate.toLocaleDateString();
            
            // Get filename or use default
            let fileName = fileNameInput.value.trim();
            if (!fileName) {
                fileName = 'Questions Collection';
            }
            if (!fileName.endsWith('.pdf')) {
                fileName += '.pdf';
            }
            
            try {
                // Create PDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'pt',
                    compress: true,
                    hotfixes: ['px_scaling']
                });
                
                let currentPage = 0;
                
                // Function to add image to PDF
                const addImageToPDF = (index) => {
                    if (index >= images.length) {
                        // All images added, save the PDF
                        pdf.save(fileName);
                        hideLoading();
                        return;
                    }
                    
                    const image = images[index];
                    
                    // Add a new page if not the first image
                    if (index > 0) {
                        pdf.addPage();
                    }
                    
                    // Add date at the top of each page
                    pdf.setFontSize(10);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(`Created on: ${dateString}`, 40, 30);
                    
                    // Calculate image dimensions to fit on the page
                    const pageWidth = pdf.internal.pageSize.getWidth() - 80; // 40pt margin on each side
                    const pageHeight = pdf.internal.pageSize.getHeight() - 80; // 40pt margin on each side
                    
                    let imgWidth = image.width;
                    let imgHeight = image.height;
                    
                    // Scale image to fit page width
                    if (imgWidth > pageWidth) {
                        const ratio = pageWidth / imgWidth;
                        imgWidth = pageWidth;
                        imgHeight = imgHeight * ratio;
                    }
                    
                    // If still too tall, scale to fit page height
                    if (imgHeight > pageHeight) {
                        const ratio = pageHeight / imgHeight;
                        imgHeight = pageHeight;
                        imgWidth = imgWidth * ratio;
                    }
                    
                    // Center image on page
                    const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
                    const y = 60; // Below the date header
                    
                    // Add image to PDF
                    pdf.addImage(image.src, 'JPEG', x, y, imgWidth, imgHeight);
                    
                    // Process next image
                    setTimeout(() => addImageToPDF(index + 1), 50);
                };
                
                // Start adding images
                addImageToPDF(0);
                
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Error generating PDF. Please try again.');
                hideLoading();
            }
        }, 100);
    }
});
