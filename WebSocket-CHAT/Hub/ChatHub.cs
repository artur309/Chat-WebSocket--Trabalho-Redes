using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace ChatAspNetCoreSignalR.Hubs
{
    public class ChatHub : Hub
    {
        public static List<string> Users { get; set; } = new List<string>();      
        public static List<string> Messages { get; set; } = new List<string>();

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        public async Task NewUser(string user)
        {
            foreach (var elem in Users)
            {
                await Clients.Caller.SendAsync("NewUser", elem);
            }
            Users.Add(user);
            await Clients.All.SendAsync("NewUser", user);
        }
        public async Task GetUsers()
        {
            foreach (var elem in Users)
            {
                await Clients.Caller.SendAsync("NewUser", elem);
            }
        }
        public async Task UserLeft(string user)
        {
            Users.Remove(user);

            await Clients.All.SendAsync("UserLeft", user);
        }
    }
}
