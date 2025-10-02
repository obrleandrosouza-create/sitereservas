-- Mesas 1,2,3,11 = 5 lugares
insert into tables(number, capacity, joinable)
values (1,5,false),(2,5,false),(3,5,false),(11,5,false)
on conflict (number) do nothing;

-- Mesas 4..10,12,13 = 2 lugares (4..10 são juntáveis)
insert into tables(number, capacity, joinable)
values (4,2,true),(5,2,true),(6,2,true),(7,2,true),(8,2,true),(9,2,true),(10,2,true),(12,2,false),(13,2,false)
on conflict (number) do nothing;
