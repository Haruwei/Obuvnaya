using Avalonia.Media.Imaging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Obuvnaya;

public class Product
{
    
    public int ProductId { get; set; }
    public string Article { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Measure { get; set; } = "шт.";
    public decimal Price { get; set; }
    public decimal? Discount { get; set; }
    public int ProdQty { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = "Не указан";
    public string Manufacturer { get; set; } = "Не указан";
    public string Description { get; set; } = string.Empty;
    public string Photo { get; set; } = "picture.png";
    public bool IsDeleted { get; set; }

    public decimal DiscountValue => Discount ?? 0m;
    public bool HasDiscount => Discount.HasValue && Discount.Value > 0;
    public decimal OldPrice => HasDiscount ? Math.Round(Price / (1 - Discount!.Value / 100m)) : 0;
    public decimal FinalPrice => HasDiscount ? Price : Price;

    public string DisplayName => $"{Article} - {ProductName}";
}

public class Category
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public override string ToString() => CategoryName;
}

public class Supplier
{
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public override string ToString() => SupplierName;
}

public class OrderDetails
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public int OrderStatus { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserLogin { get; set; } = string.Empty;
    public int DeliveryPointId { get; set; }
    public string DeliveryPointAddress { get; set; } = string.Empty;
    public DateTime? DeliveryDate { get; set; }
    public string ReceiveCode { get; set; } = string.Empty;
    public List<OrderItem> Items { get; set; } = new();

    public int ItemsCount => Items.Count;
    public decimal TotalAmount => Items.Sum(i => i.Total);
    public string DisplayDate => OrderDate.ToString("dd.MM.yyyy HH:mm");
    public string DeliveryDateDisplay => DeliveryDate?.ToString("dd.MM.yyyy") ?? "Не указана";
}

public class OrderItem
{
    public int OrderItemId { get; set; }
    public string ProductArticle { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total => Price * Quantity;
}

public class OrderStatus
{
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public override string ToString() => StatusName;
}

public class DeliveryPoint
{
    public int DeliveryPointId { get; set; }
    public string Address { get; set; } = string.Empty;
    public override string ToString() => Address;
}

public class User
{
    public int UserId { get; set; }
    public string Login { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? Surname { get; set; }
    public string RoleName { get; set; } = string.Empty;

    public string FullName => $"{LastName} {FirstName} {Surname}".Trim();
    public override string ToString() => $"{FullName} ({Login})";
}
