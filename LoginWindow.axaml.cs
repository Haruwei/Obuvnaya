using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.IO;

namespace Obuvnaya;

public partial class LoginWindow : Window
{
    private readonly DbConnection _db = new();

    public LoginWindow()
    {
        InitializeComponent();
    }

    private void OnLoginClick(object? sender, RoutedEventArgs e)
    {
        var login = LoginBox.Text?.Trim();
        var password = PasswordBox.Text?.Trim();

        if (string.IsNullOrEmpty(login) || string.IsNullOrEmpty(password))
        {
            ErrorText.Text = "Введите логин и пароль";
            return;
        }

        try
        {
            var (userId, roleId) = _db.Authenticate(login, password);

            if (userId == -1)
            {
                return;
            }
            new MainWindow(roleId).Show();
            Close();
        }
        catch
        {

        }
    }

    private void OnGuestClick(object? sender, RoutedEventArgs e)
    {
        new MainWindow(1).Show();
        Close();
    }
}
