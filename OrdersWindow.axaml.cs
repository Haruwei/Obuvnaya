using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Layout;
using Avalonia.Media;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Obuvnaya;

public partial class OrdersWindow : Window
{
    private readonly DbConnection _db = new();
    private int _roleId;
    private List<OrderDetails> _orders = new();
    private OrderDetails? _selectedOrder;
    private CancellationTokenSource? _menuCts;

    public OrdersWindow(int roleId)
    {
        InitializeComponent();
        _roleId = roleId;

        // Только админ (роль 4) может добавлять/редактировать/удалять заказы
        AddOrderBtn.IsVisible = _roleId == 4;
        
        RoleText.Text = _roleId switch
        {
            4 => "Режим администратора",
            3 => "Режим менеджера",
            2 => "Режим авторизованного клиента",
            _ => "Режим просмотра (гость)"
        };

        LoadOrders();
    }

    private void LoadOrders()
    {
        try
        {
            _orders = _db.GetOrders();
            OrdersList.ItemsSource = _orders;
        }
        catch (Exception ex)
        {
            ShowMessage("Ошибка", ex.Message);
        }
    }

    private void OnOrderClick(object? sender, Avalonia.Input.PointerPressedEventArgs e)
    {
        if (sender is not Border border || border.DataContext is not OrderDetails order) return;

        _selectedOrder = order;

        // Только для админа (роль 4)
        if (_roleId != 4) return;

        // Двойной клик - редактирование
        if (e.ClickCount == 2)
        {
            ShowEditDialog(order);
        }
        else if (e.ClickCount == 1)
        {
            // Одиночный клик - контекстное меню
            ShowAdminMenu(border, order);
        }
    }

    private void ShowAdminMenu(Border border, OrderDetails order)
    {
        // Отменяем предыдущий таймер если есть
        _menuCts?.Cancel();
        _menuCts = new CancellationTokenSource();

        var menu = new ContextMenu();

        var editItem = new MenuItem { Header = "Редактировать" };
        editItem.Click += (s, e) => 
        {
            _menuCts?.Cancel();
            ShowEditDialog(order);
        };

        var deleteItem = new MenuItem { Header = "Удалить" };
        deleteItem.Click += async (s, e) => 
        {
            _menuCts?.Cancel();
            await DeleteOrder(order);
        };

        menu.Items.Add(editItem);
        menu.Items.Add(deleteItem);
        
        // Открываем меню
        menu.Open(border);

        // Авто-закрытие через 5 секунд
        var token = _menuCts.Token;
        Task.Run(async () =>
        {
            try
            {
                await Task.Delay(5000, token);
                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                {
                    if (!token.IsCancellationRequested)
                    {
                        menu.Close();
                    }
                });
            }
            catch (OperationCanceledException)
            {
                // Нормально, меню закрыто вручную
            }
        });
    }

    private void ShowEditDialog(OrderDetails order)
    {
        var dialog = new OrderEditDialog(_db, order);
        dialog.Closed += (s, e) => LoadOrders();
        dialog.ShowDialog(this);
    }

    private async Task DeleteOrder(OrderDetails order)
    {
        var confirm = await ShowConfirm($"Удалить заказ №{order.OrderId}?");
        if (!confirm) return;

        try
        {
            await _db.DeleteOrder(order.OrderId);
            LoadOrders();
            await ShowMessage("Успешно", "Заказ удален");
        }
        catch (Exception ex)
        {
            await ShowMessage("Ошибка", ex.Message);
        }
    }

    private void OnAddOrderClick(object? sender, RoutedEventArgs e)
    {
        ShowEditDialog(null!);
    }

    private void OnRefreshClick(object? sender, RoutedEventArgs e)
    {
        LoadOrders();
    }

    private void OnCloseClick(object? sender, RoutedEventArgs e)
    {
        Close();
    }

    private async Task ShowMessage(string title, string message)
    {
        var dialog = new Window
        {
            Title = title,
            Width = 350,
            Height = 150,
            WindowStartupLocation = WindowStartupLocation.CenterOwner,
            Content = new StackPanel
            {
                Margin = new Thickness(20),
                Spacing = 15,
                Children =
                {
                    new TextBlock { Text = message, TextWrapping = Avalonia.Media.TextWrapping.Wrap },
                    new Button { Content = "OK", HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Center, Width = 80 }
                }
            }
        };
        ((Button)((StackPanel)dialog.Content).Children[1]).Click += (s, e) => dialog.Close();
        await dialog.ShowDialog(this);
    }

    private async Task<bool> ShowConfirm(string message)
    {
        var tcs = new TaskCompletionSource<bool>();
        var dialog = new Window
        {
            Title = "Подтверждение",
            Width = 350,
            Height = 150,
            WindowStartupLocation = WindowStartupLocation.CenterOwner,
            Content = new StackPanel
            {
                Margin = new Thickness(20),
                Spacing = 15,
                Children =
                {
                    new TextBlock { Text = message, TextWrapping = Avalonia.Media.TextWrapping.Wrap },
                    new StackPanel
                    {
                        Orientation = Avalonia.Layout.Orientation.Horizontal,
                        HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right,
                        Spacing = 10,
                        Children =
                        {
                            new Button { Content = "Да", Width = 70, Tag = true },
                            new Button { Content = "Нет", Width = 70, Tag = false }
                        }
                    }
                }
            }
        };

        var buttons = ((StackPanel)((StackPanel)dialog.Content).Children[1]).Children;
        foreach (Button btn in buttons)
        {
            btn.Click += (s, e) =>
            {
                tcs.SetResult(btn.Tag is bool b && b);
                dialog.Close();
            };
        }

        await dialog.ShowDialog(this);
        return await tcs.Task;
    }
}