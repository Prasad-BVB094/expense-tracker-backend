// const API = "http://localhost:5000";

/* ------------------------------------------------------------------
   UTILITY: Get today's date in IST timezone
------------------------------------------------------------------ */
function getTodayIST() {
    // Create date in IST using Intl API
    const istDate = new Date().toLocaleString('en-CA', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    // Format is already YYYY-MM-DD from en-CA locale
    return istDate.split(',')[0];
}

/* ------------------------------------------------------------------
   SET DEFAULT DATE ON PAGE LOAD
------------------------------------------------------------------ */
window.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById("date");
    if (dateInput) {
        dateInput.value = getTodayIST();
    }
});

/* ------------------------------------------------------------------
   SAVE EXPENSE  (for add-expense.html)
------------------------------------------------------------------ */
async function saveExpense() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Please login first");

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value;

    const res = await fetch(`${API}/expenses/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user.id,
            amount,
            category,
            date,
            note
        })
    });

    const data = await res.json();
    alert(data.message || "Expense saved!");

    // clear form
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";
    // Reset date to today
    document.getElementById("date").value = getTodayIST();
}

/* ------------------------------------------------------------------
   LOAD EXPENSES  (for view-expenses.html)
------------------------------------------------------------------ */

let allExpenses = []; // Store all expenses for filtering

async function loadExpenses() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Please login first");

    const res = await fetch(`${API}/expenses/all/${user.id}`);
    const data = await res.json();
    
    allExpenses = data; // Store for filtering
    displayExpenses(data);
}

/* ------------------------------------------------------------------
   UTILITY: Format date to DD-MM-YYYY
------------------------------------------------------------------ */
function formatDateDisplay(dateString) {
    if (!dateString) return '';
    
    // Handle if dateString is already a date object or various formats
    let dateParts;
    
    if (dateString.includes('-')) {
        // Format: YYYY-MM-DD
        dateParts = dateString.split('T')[0].split('-');
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        return `${day}-${month}-${year}`;
    }
    
    return dateString; // Return as-is if format is unexpected
}

function displayExpenses(expenses) {
    let rows = "";
    expenses.forEach(exp => {
        rows += `
        <tr>
            <td>₹${exp.amount}</td>
            <td>${exp.category}</td>
            <td>${formatDateDisplay(exp.date)}</td>
            <td>${exp.note || ""}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editExpense(${exp.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteExpense(${exp.id})">Delete</button>
            </td>
        </tr>`;
    });

    document.getElementById("table-body").innerHTML = rows || '<tr><td colspan="5" style="text-align:center;">No expenses found</td></tr>';
}

function applyFilters() {
    const categoryFilter = document.getElementById("filter-category").value;
    const dateFilter = document.getElementById("filter-date").value;
    const searchFilter = document.getElementById("filter-search").value.toLowerCase();

    let filtered = allExpenses.filter(exp => {
        const matchCategory = !categoryFilter || exp.category === categoryFilter;
        const matchDate = !dateFilter || exp.date === dateFilter;
        const matchSearch = !searchFilter || (exp.note && exp.note.toLowerCase().includes(searchFilter));
        
        return matchCategory && matchDate && matchSearch;
    });

    displayExpenses(filtered);
}

async function deleteExpense(id) {
    const confirmDelete = confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;

    const res = await fetch(`${API}/expenses/delete/${id}`, {
        method: "DELETE"
    });

    const data = await res.json();
    alert(data.message || "Deleted");

    loadExpenses(); // refresh table
}


/* ------------------------------------------------------------------
   UTILITY: Convert DD-MM-YYYY back to YYYY-MM-DD for input field
------------------------------------------------------------------ */
function convertToInputFormat(displayDate) {
    if (!displayDate) return '';
    
    if (displayDate.includes('-')) {
        const parts = displayDate.split('-');
        // Check if it's already YYYY-MM-DD format
        if (parts[0].length === 4) {
            return displayDate; // Already in correct format
        }
        // Convert DD-MM-YYYY to YYYY-MM-DD
        if (parts[0].length === 2) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    
    return displayDate;
}

function editExpense(id) {
    const row = event.target.closest("tr");
    const amount = row.children[0].innerText.replace("₹", "");
    const category = row.children[1].innerText;
    const dateDisplay = row.children[2].innerText; // This is DD-MM-YYYY format
    const note = row.children[3].innerText;

    document.getElementById("edit-id").value = id;
    document.getElementById("edit-amount").value = amount;
    document.getElementById("edit-category").value = category;
    // Convert DD-MM-YYYY back to YYYY-MM-DD for the input field
    document.getElementById("edit-date").value = convertToInputFormat(dateDisplay);
    document.getElementById("edit-note").value = note;

    document.getElementById("edit-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("edit-modal").style.display = "none";
}


async function saveEdit() {
    const id = document.getElementById("edit-id").value;

    const updated = {
        amount: document.getElementById("edit-amount").value,
        category: document.getElementById("edit-category").value,
        date: document.getElementById("edit-date").value,
        note: document.getElementById("edit-note").value
    };

    const res = await fetch(`${API}/expenses/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    });

    const data = await res.json();
    alert(data.message || "Updated");

    closeModal();
    loadExpenses();
}


// Run when view-expenses.html loads
if (window.location.pathname.includes("view-expenses.html")) {
    window.onload = loadExpenses;
}
