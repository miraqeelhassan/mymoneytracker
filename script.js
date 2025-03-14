// ✅ Load Firebase SDKs (Ensure this is in index.html before this script)
const firebaseConfig = {
    apiKey: "AIzaSyAOnWB7cYInpPguAmy7H3m4iWwRJgZ4jJQ",
    authDomain: "my-money-tracker-245aa.firebaseapp.com",
    projectId: "my-money-tracker-245aa",
    storageBucket: "my-money-tracker-245aa.appspot.com",
    messagingSenderId: "458627255479",
    appId: "1:458627255479:web:0cd7f8f526efb783b19132"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ✅ User Authentication Functions
function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert("Sign Up Successful!"))
        .catch(error => alert(error.message));
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("tracker-section").style.display = "block";
            loadExpenses();
        })
        .catch(error => alert(error.message));
}

function logout() {
    auth.signOut().then(() => {
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("tracker-section").style.display = "none";
    });
}

// ✅ Check Authentication State
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("tracker-section").style.display = "block";
        loadExpenses();
    }
});

// ✅ Expense Tracker Functions
function addExpense() {
    const item = document.getElementById("item").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;

    if (item && amount && date) {
        db.collection("expenses").add({
            item,
            amount: Number(amount),
            date
        }).then(() => {
            alert("Expense added!");
            loadExpenses();
        });
    } else {
        alert("Please fill all fields.");
    }
}

// ✅ Load Expenses from Firestore
function loadExpenses() {
    db.collection("expenses").onSnapshot(snapshot => {
        let total = 0;
        document.getElementById("expense-list").innerHTML = "";
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            total += data.amount;
            document.getElementById("expense-list").innerHTML += `
                <tr>
                    <td>${data.item}</td>
                    <td>₹${data.amount}</td>
                    <td>${data.date}</td>
                    <td><button onclick="deleteExpense('${doc.id}')">Delete</button></td>
                </tr>
            `;
        });
        document.getElementById("total-amount").innerText = total;
    });
}

// ✅ Delete Expense
function deleteExpense(id) {
    db.collection("expenses").doc(id).delete().then(() => {
        alert("Expense deleted!");
        loadExpenses();
    });
}

// ✅ Download PDF of Expenses
function downloadPDF() {
    const monthYear = document.getElementById("pdf-month").value;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text(`Expenses for ${monthYear}`, 10, 10);
    
    let y = 20;
    db.collection("expenses").get().then(snapshot => {
        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            if (data.date.startsWith(monthYear)) {
                doc.text(`${data.date} - ${data.item}: ₹${data.amount}`, 10, y);
                y += 10;
            }
        });
        doc.save(`Expenses_${monthYear}.pdf`);
    });
}
