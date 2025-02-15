document.getElementById('processFilesBtn').addEventListener('click', function () {
    const files = document.getElementById('file-input').files;
    const contactName1 = document.getElementById('contactName1Input').value.trim();
    const contactName2 = document.getElementById('contactName2Input').value.trim();
    const renameMode = document.getElementById('renameMode').value;
    const mergeOption = document.getElementById('mergeOption').value; // Pilihan gabung/pisah

    if (!contactName1 || !contactName2) {
        alert('Harap mengisi nama kontak 1 dan kontak 2.');
        return;
    }

    const fileAreas = document.getElementById('file-areas');
    fileAreas.innerHTML = ''; // Kosongkan area sebelumnya

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const lines = e.target.result.split('\n').map(line => line.trim()).filter(Boolean);
            if (lines.length === 0) return;

            let originalFileName = file.name.replace(/\.[^/.]+$/, ''); // Nama file tanpa ekstensi
            let newFileName = renameMode === "original" ? originalFileName : originalFileName.slice(-parseInt(renameMode));

            const firstNumber = lines[0].replace(/^[^0-9+]+/, '');
            const otherNumbers = lines.slice(1);

            const container = document.createElement('div');
            container.classList.add('file-container');

            const fileLabel = document.createElement('p');
            fileLabel.textContent = `Nama File TXT Asli: ${file.name}`;
            fileLabel.style.fontWeight = 'bold';
            container.appendChild(fileLabel);

            const fileNameInput = document.createElement('input');
            fileNameInput.type = 'text';
            fileNameInput.value = newFileName;
            fileNameInput.placeholder = 'Nama file untuk VCF';
            container.appendChild(fileNameInput);

            if (mergeOption === "gabung") {
                // Gabung semua kontak dalam satu file
                const downloadBtn = document.createElement('button');
                downloadBtn.textContent = 'Download Semua Kontak';
                downloadBtn.addEventListener('click', () => {
                    let vcfContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName1}\nTEL:${formatPhoneNumber(firstNumber)}\nEND:VCARD\n`;
                    otherNumbers.forEach((number, index) => {
                        vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName2} ${index + 1}\nTEL:${formatPhoneNumber(number)}\nEND:VCARD\n`;
                    });
                    downloadFile(vcfContent, `${fileNameInput.value.trim() || newFileName}.vcf`);
                });
                container.appendChild(downloadBtn);
            } else {
                // Pisah file menjadi dua bagian
                const adminDownloadBtn = document.createElement('button');
                adminDownloadBtn.textContent = 'Download Kontak Pertama';
                adminDownloadBtn.addEventListener('click', () => {
                    const adminFileName = `ADMIN_${fileNameInput.value.trim() || newFileName}`;
                    const adminVcfContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName1}\nTEL:${formatPhoneNumber(firstNumber)}\nEND:VCARD\n`;
                    downloadFile(adminVcfContent, `${adminFileName}.vcf`);
                });
                container.appendChild(adminDownloadBtn);

                if (otherNumbers.length > 0) {
                    const otherDownloadBtn = document.createElement('button');
                    otherDownloadBtn.textContent = 'Download Kontak Kedua+';
                    otherDownloadBtn.addEventListener('click', () => {
                        let vcfContent = '';
                        otherNumbers.forEach((number, index) => {
                            vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName2} ${index + 1}\nTEL:${formatPhoneNumber(number)}\nEND:VCARD\n`;
                        });
                        downloadFile(vcfContent, `${fileNameInput.value.trim() || newFileName}.vcf`);
                    });
                    container.appendChild(otherDownloadBtn);
                }
            }

            fileAreas.appendChild(container);
        };
        reader.readAsText(file);
    });
});

function formatPhoneNumber(number) {
    if (!number.startsWith('+')) {
        return `+${number}`;
    }
    return number;
}

function downloadFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
